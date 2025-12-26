import { Request, Response } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { AuthService } from '../services/authService';

const userRepository = new UserRepository();
const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { email, password, name, role, avatar_url } = req.body;

      // Security: Public signup can only create 'developer' role
      // Admins must use /api/users endpoint to create team_lead or admin
      const userRole = role === 'developer' ? 'developer' : 'developer';
      
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'User with this email already exists',
            code: 'USER_EXISTS',
          },
        });
      }

      // Hash password
      const password_hash = await authService.hashPassword(password);

      // Create user (always as developer for public signup)
      const user = await userRepository.create({
        email,
        password_hash,
        name,
        role: userRole,
        avatar_url,
      });

      // Generate tokens
      const token = authService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = authService.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove password hash from response
      const { password_hash: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
        },
        message: 'User created successfully',
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      // Verify password
      const isValidPassword = await authService.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      // Generate tokens
      const token = authService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = authService.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove password hash from response
      const { password_hash: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
        },
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        });
      }

      const user = await userRepository.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      const { password_hash: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error('Get me error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Refresh token is required',
            code: 'VALIDATION_ERROR',
          },
        });
      }

      // Verify refresh token
      const decoded = authService.verifyRefreshToken(refreshToken);

      // Generate new tokens
      const newToken = authService.generateToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      const newRefreshToken = authService.generateRefreshToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      return res.status(200).json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired refresh token',
          code: 'INVALID_TOKEN',
        },
      });
    }
  }
}
