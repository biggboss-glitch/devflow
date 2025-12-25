import { Request, Response } from 'express';
import { TeamService } from '../services/teamService';

const teamService = new TeamService();

export class TeamController {
  async create(req: Request, res: Response) {
    try {
      const { organization_id, name, description } = req.body;
      const team = await teamService.createTeam({ organization_id, name, description });

      return res.status(201).json({
        success: true,
        data: team,
        message: 'Team created successfully',
      });
    } catch (error: any) {
      console.error('Create team error:', error);
      if (error.message === 'Organization not found') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        });
      }
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const organizationId = req.query.organization_id as string;
      const teams = await teamService.getTeams(organizationId);

      return res.status(200).json({
        success: true,
        data: teams,
      });
    } catch (error) {
      console.error('Get teams error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const team = await teamService.getTeamById(id);

      if (!team) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Team not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: team,
      });
    } catch (error) {
      console.error('Get team error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const team = await teamService.updateTeam(id, updates);

      if (!team) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Team not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: team,
        message: 'Team updated successfully',
      });
    } catch (error) {
      console.error('Update team error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await teamService.deleteTeam(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Team not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Team deleted successfully',
      });
    } catch (error) {
      console.error('Delete team error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user_id, role } = req.body;

      const member = await teamService.addTeamMember(id, user_id, role);

      return res.status(201).json({
        success: true,
        data: member,
        message: 'Team member added successfully',
      });
    } catch (error: any) {
      console.error('Add team member error:', error);
      if (error.message === 'Team not found' || error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        });
      }
      if (error.message === 'User is already a team member') {
        return res.status(409).json({
          success: false,
          error: {
            message: error.message,
            code: 'CONFLICT',
          },
        });
      }
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { id, userId } = req.params;
      const removed = await teamService.removeTeamMember(id, userId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Team or member not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Team member removed successfully',
      });
    } catch (error) {
      console.error('Remove team member error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const members = await teamService.getTeamMembers(id);

      return res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error: any) {
      console.error('Get team members error:', error);
      if (error.message === 'Team not found') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        });
      }
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
