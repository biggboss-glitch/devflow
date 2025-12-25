import { Request, Response } from 'express';
import { OrganizationService } from '../services/organizationService';

const organizationService = new OrganizationService();

export class OrganizationController {
  async create(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const organization = await organizationService.createOrganization({ name, description });

      return res.status(201).json({
        success: true,
        data: organization,
        message: 'Organization created successfully',
      });
    } catch (error) {
      console.error('Create organization error:', error);
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await organizationService.getOrganizations(page, limit);

      return res.status(200).json({
        success: true,
        data: result.organizations,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error('Get organizations error:', error);
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
      const organization = await organizationService.getOrganizationById(id);

      if (!organization) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Organization not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: organization,
      });
    } catch (error) {
      console.error('Get organization error:', error);
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

      const organization = await organizationService.updateOrganization(id, updates);

      if (!organization) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Organization not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: organization,
        message: 'Organization updated successfully',
      });
    } catch (error) {
      console.error('Update organization error:', error);
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
      const deleted = await organizationService.deleteOrganization(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Organization not found',
            code: 'NOT_FOUND',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Organization deleted successfully',
      });
    } catch (error) {
      console.error('Delete organization error:', error);
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
