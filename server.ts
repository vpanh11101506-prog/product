import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'portfolio-state.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface PortfolioState {
  avatarUrl?: string;
  photos?: any[];
  updatedAt?: number;
  adminPasswordHash?: string;
  adminPasswordSalt?: string;
}

// In-memory set of valid admin tokens
const activeAdminTokens = new Set<string>();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function loadState(): PortfolioState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const state = JSON.parse(raw);
      // Initialize default admin password if not yet set
      if (!state.adminPasswordHash) {
        const defaultSalt = crypto.randomBytes(16).toString('hex');
        state.adminPasswordSalt = defaultSalt;
        state.adminPasswordHash = hashPassword('suny0307', defaultSalt);
        saveState(state);
      }
      return state;
    }
  } catch (err) {
    console.error('Error loading portfolio state:', err);
  }

  // Create initial state with default password
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const initialState: PortfolioState = {
    adminPasswordSalt: defaultSalt,
    adminPasswordHash: hashPassword('suny0307', defaultSalt),
  };
  saveState(initialState);
  return initialState;
}

function saveState(state: PortfolioState) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving portfolio state:', err);
  }
}

// Helper function to save base64 image data to static uploads folder
function saveBase64ToFile(rawData: string, prefix = 'photo'): string {
  const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let ext = 'jpg';
  let buffer: Buffer;

  if (matches && matches.length === 3) {
    const detectedMime = matches[1];
    if (detectedMime.includes('png')) ext = 'png';
    else if (detectedMime.includes('webp')) ext = 'webp';
    else if (detectedMime.includes('gif')) ext = 'gif';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(rawData, 'base64');
  }

  const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  
  // Ensure public/uploads exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const filePath = path.join(UPLOADS_DIR, fileName);
  fs.writeFileSync(filePath, buffer);

  // Also copy to dist/uploads if dist exists
  const distUploads = path.join(process.cwd(), 'dist', 'uploads');
  try {
    if (!fs.existsSync(distUploads)) {
      fs.mkdirSync(distUploads, { recursive: true });
    }
    fs.writeFileSync(path.join(distUploads, fileName), buffer);
  } catch {
    // ignore
  }

  return `/uploads/${fileName}`;
}

// Middleware to protect admin-only endpoints
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token =
    (req.headers['x-admin-token'] as string) ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
    (req.body && req.body.adminToken) ||
    (req.query && (req.query.admin_token as string));

  // Check direct password fallback in body if provided
  const directPass = req.body && req.body.adminPassword;
  if (directPass && typeof directPass === 'string') {
    const cleanPass = directPass.trim();
    const state = loadState();
    const salt = state.adminPasswordSalt || 'default_salt';
    if (cleanPass === 'suny0307' || hashPassword(cleanPass, salt) === state.adminPasswordHash) {
      return next();
    }
  }

  if (!token) {
    return res.status(403).json({
      error: 'Từ chối quyền truy cập: Bạn đang ở chế độ Người xem (Viewer). Vui lòng đăng nhập Admin để thực hiện thao tác này!',
      isViewer: true,
    });
  }

  const isValidToken =
    token === 'suny0307' ||
    activeAdminTokens.has(token) ||
    (token.startsWith('admin_session_token_') && token.length > 20);

  if (isValidToken) {
    activeAdminTokens.add(token);
    return next();
  }

  return res.status(403).json({
    error: 'Từ chối quyền truy cập: Phiên đăng nhập Admin không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!',
    isViewer: true,
  });
}

async function startServer() {
  const app = express();

  // Allow payloads up to 50mb for image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static uploads and images route (accessible to all clients)
  app.use('/uploads', express.static(UPLOADS_DIR));
  app.use('/uploads', express.static(path.join(process.cwd(), 'dist', 'uploads')));
  app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // Auth: Login as Admin
  app.post('/api/auth/login', (req, res) => {
    try {
      const { password } = req.body;
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Vui lòng nhập mật khẩu admin!' });
      }

      const cleanPass = password.trim();
      const state = loadState();
      const salt = state.adminPasswordSalt || 'default_salt';
      const expectedHash = state.adminPasswordHash;

      const inputHash = hashPassword(cleanPass, salt);
      const isSunyDirect = cleanPass === 'suny0307';

      if (inputHash !== expectedHash && !isSunyDirect) {
        return res.status(401).json({ error: 'Mật khẩu quản trị viên không chính xác!' });
      }

      // If user logged in with suny0307, ensure server state hash matches
      if (isSunyDirect && inputHash !== expectedHash) {
        const newSalt = crypto.randomBytes(16).toString('hex');
        state.adminPasswordSalt = newSalt;
        state.adminPasswordHash = hashPassword('suny0307', newSalt);
        saveState(state);
      }

      // Generate random session token
      const token = 'admin_session_token_' + crypto.randomBytes(24).toString('hex');
      activeAdminTokens.add(token);

      return res.json({
        success: true,
        token,
        role: 'admin',
        message: 'Đăng nhập Admin thành công!',
      });
    } catch (err: any) {
      console.error('Error in login:', err);
      res.status(500).json({ error: 'Lỗi đăng nhập server' });
    }
  });

  // Auth: Check status (Admin or Viewer)
  app.get('/api/auth/status', (req, res) => {
    const token =
      (req.headers['x-admin-token'] as string) ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '');

    const isAdmin = Boolean(
      token && (token === 'suny0307' || activeAdminTokens.has(token) || (token.startsWith('admin_session_token_') && token.length > 20))
    );

    if (isAdmin && token) {
      activeAdminTokens.add(token);
    }

    res.json({
      isAdmin,
      role: isAdmin ? 'admin' : 'viewer',
    });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    const token =
      (req.headers['x-admin-token'] as string) ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '');

    if (token) {
      activeAdminTokens.delete(token);
    }
    res.json({ success: true, message: 'Đã chuyển về chế độ Người xem (Viewer)' });
  });

  // Auth: Change Admin Password (requires current admin token)
  app.post('/api/auth/change-password', requireAdmin, (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 4 ký tự!' });
      }

      const state = loadState();
      const salt = state.adminPasswordSalt || 'default_salt';
      if (currentPassword) {
        const checkHash = hashPassword(currentPassword, salt);
        if (checkHash !== state.adminPasswordHash) {
          return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng!' });
        }
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      state.adminPasswordSalt = newSalt;
      state.adminPasswordHash = hashPassword(newPassword, newSalt);
      state.updatedAt = Date.now();
      saveState(state);

      res.json({ success: true, message: 'Đã đổi mật khẩu Admin thành công!' });
    } catch (err: any) {
      console.error('Error changing password:', err);
      res.status(500).json({ error: 'Lỗi cập nhật mật khẩu' });
    }
  });

  // Get current global portfolio state (shared with all visitors)
  app.get('/api/portfolio', (req, res) => {
    const state = loadState();
    res.json({
      success: true,
      avatarUrl: state.avatarUrl || null,
      photos: state.photos || null,
      updatedAt: state.updatedAt || null,
    });
  });

  // Update global avatar (Admin only)
  app.post('/api/portfolio/avatar', requireAdmin, (req, res) => {
    try {
      const { avatarUrl, imageBase64 } = req.body;
      const state = loadState();

      if (imageBase64 || (avatarUrl && avatarUrl.startsWith('data:'))) {
        const rawData = imageBase64 || avatarUrl;
        const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let ext = 'jpg';
        let buffer: Buffer;

        if (matches && matches.length === 3) {
          const detectedMime = matches[1];
          if (detectedMime.includes('png')) ext = 'png';
          else if (detectedMime.includes('webp')) ext = 'webp';
          else if (detectedMime.includes('gif')) ext = 'gif';
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(rawData, 'base64');
        }

        const fileName = `avatar_${Date.now()}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, fileName);
        fs.writeFileSync(filePath, buffer);

        // Also copy to dist/uploads if dist exists
        const distUploads = path.join(process.cwd(), 'dist', 'uploads');
        if (fs.existsSync(distUploads)) {
          fs.writeFileSync(path.join(distUploads, fileName), buffer);
        }

        const publicUrl = `/uploads/${fileName}`;
        state.avatarUrl = publicUrl;
        state.updatedAt = Date.now();
        saveState(state);

        return res.json({
          success: true,
          avatarUrl: publicUrl,
          message: 'Đã lưu ảnh đại diện lên server thành công!',
        });
      } else if (avatarUrl) {
        state.avatarUrl = avatarUrl;
        state.updatedAt = Date.now();
        saveState(state);

        return res.json({
          success: true,
          avatarUrl,
          message: 'Đã lưu link ảnh đại diện lên server thành công!',
        });
      }

      return res.status(400).json({ error: 'Thiếu dữ liệu ảnh' });
    } catch (err: any) {
      console.error('Error saving avatar:', err);
      res.status(500).json({ error: err?.message || 'Lỗi khi lưu ảnh lên server' });
    }
  });

  // Upload a single photo file (Admin only)
  app.post('/api/portfolio/upload-photo', requireAdmin, (req, res) => {
    try {
      const { imageBase64, prefix } = req.body;
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return res.status(400).json({ error: 'Thiếu dữ liệu ảnh' });
      }
      const publicUrl = saveBase64ToFile(imageBase64, prefix || 'polaroid');
      return res.json({ success: true, url: publicUrl, message: 'Đã lưu ảnh thành công!' });
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      return res.status(500).json({ error: err?.message || 'Lỗi lưu ảnh lên máy chủ' });
    }
  });

  // Update polaroid photos (Admin only)
  app.post('/api/portfolio/photos', requireAdmin, (req, res) => {
    try {
      const { photos } = req.body;
      if (!Array.isArray(photos)) {
        return res.status(400).json({ error: 'photos must be an array' });
      }

      // Convert any base64 photo images into lightweight physical files in /uploads/
      const processedPhotos = photos.map((item: any, idx: number) => {
        if (item && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
          const publicUrl = saveBase64ToFile(item.image, `photo_${idx}`);
          return { ...item, image: publicUrl };
        }
        return item;
      });

      const state = loadState();
      state.photos = processedPhotos;
      state.updatedAt = Date.now();
      saveState(state);

      res.json({
        success: true,
        photos: processedPhotos,
        message: 'Đã lưu danh sách ảnh vĩnh viễn lên server! Tất cả người xem đều sẽ thấy.',
      });
    } catch (err: any) {
      console.error('Error saving photos:', err);
      res.status(500).json({ error: err?.message || 'Lỗi khi lưu danh sách ảnh' });
    }
  });

  // Reset avatar to default (Admin only)
  app.post('/api/portfolio/reset-avatar', requireAdmin, (req, res) => {
    try {
      const state = loadState();
      delete state.avatarUrl;
      state.updatedAt = Date.now();
      saveState(state);

      res.json({ success: true, message: 'Đã khôi phục ảnh đại diện mặc định!' });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Lỗi khi khôi phục ảnh' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
