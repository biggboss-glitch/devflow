import { Request, Response } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { AuthService } from '../services/authService';

const userRepository = new UserRepository();
const authService = new AuthService();

export class UserController {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const users = await userRepository.findAll(limit, offset);
      
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const user = await userRepository.findById(id);
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
      console.error('Get user by ID error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Create user (Admin only)
   * Used to create team leads and developers
   */
  async createUser(req: Request, res: Response) {
    try {
      const { email, password, name, role, avatar_url } = req.body;

      // Validate role - admin can only create team_lead or developer
      if (role && !['team_lead', 'developer'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid role. Admin can only create team_lead or developer',
            code: 'INVALID_ROLE',
          },
        });
      }

      // Default to developer if role not specified
      const userRole = role || 'developer';

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

      // Create user
      const user = await userRepository.create({
        email,
        password_hash,
        name,
        role: userRole,
        avatar_url,
      });

      // Remove password hash from response
      const { password_hash: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        data: userWithoutPassword,
        message: `User created successfully as ${userRole}`,
      });
    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Update user (Admin only)
   * Can update name, email, role, avatar
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, role, avatar_url } = req.body;

      // Check if user exists
      const existingUser = await userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      // Validate role if provided
      if (role && !['admin', 'team_lead', 'developer'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid role',
            code: 'INVALID_ROLE',
          },
        });
      }

      // Prevent admin from changing their own role
      if (role && id === req.user?.userId && role !== existingUser.role) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot change your own role',
            code: 'FORBIDDEN',
          },
        });
      }

      // Check email uniqueness if email is being updated
      if (email && email !== existingUser.email) {
        const emailExists = await userRepository.findByEmail(email);
        if (emailExists) {
          return res.status(409).json({
            success: false,
            error: {
              message: 'Email already in use',
              code: 'EMAIL_EXISTS',
            },
          });
        }
      }

      // Update user
      const updatedUser = await userRepository.update(id, {
        name,
        email,
        role,
        avatar_url,
      });

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'Failed to update user',
            code: 'UPDATE_FAILED',
          },
        });
      }

      const { password_hash: _, ...userWithoutPassword } = updatedUser;

      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
        message: 'User updated successfully',
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user?.userId) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot delete your own account',
            code: 'FORBIDDEN',
          },
        });
      }

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      const deleted = await userRepository.delete(id);
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'Failed to delete user',
            code: 'DELETE_FAILED',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Promote developer to team lead (Admin only)
   */
  async promoteToTeamLead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      if (user.role === 'team_lead') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'User is already a team lead',
            code: 'ALREADY_TEAM_LEAD',
          },
        });
      }

      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot change admin role',
            code: 'FORBIDDEN',
          },
        });
      }

      const updatedUser = await userRepository.update(id, { role: 'team_lead' });
      const { password_hash: _, ...userWithoutPassword } = updatedUser!;

      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
        message: 'User promoted to team lead',
      });
    } catch (error) {
      console.error('Promote to team lead error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * Demote team lead to developer (Admin only)
   */
  async demoteToDeveloper(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
          },
        });
      }

      if (user.role === 'developer') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'User is already a developer',
            code: 'ALREADY_DEVELOPER',
          },
        });
      }

      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Cannot change admin role',
            code: 'FORBIDDEN',
          },
        });
      }

      const updatedUser = await userRepository.update(id, { role: 'developer' });
      const { password_hash: _, ...userWithoutPassword } = updatedUser!;

      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
        message: 'User demoted to developer',
      });
    } catch (error) {
      console.error('Demote to developer error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}

