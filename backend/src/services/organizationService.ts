import { OrganizationRepository } from '../repositories/organizationRepository';
import { Organization } from '../models/types';

export class OrganizationService {
  private organizationRepo: OrganizationRepository;

  constructor() {
    this.organizationRepo = new OrganizationRepository();
  }

  async createOrganization(data: {
    name: string;
    description?: string;
  }): Promise<Organization> {
    return this.organizationRepo.create(data);
  }

  async getOrganizations(page = 1, limit = 50): Promise<{
    organizations: Organization[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const organizations = await this.organizationRepo.findAll(limit, offset);
    const total = await this.organizationRepo.count();
    const totalPages = Math.ceil(total / limit);

    return {
      organizations,
      total,
      page,
      totalPages,
    };
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.organizationRepo.findById(id);
  }

  async updateOrganization(
    id: string,
    updates: Partial<Pick<Organization, 'name' | 'description'>>
  ): Promise<Organization | null> {
    const organization = await this.organizationRepo.findById(id);
    if (!organization) {
      return null;
    }
    return this.organizationRepo.update(id, updates);
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const organization = await this.organizationRepo.findById(id);
    if (!organization) {
      return false;
    }
    return this.organizationRepo.delete(id);
  }
}
