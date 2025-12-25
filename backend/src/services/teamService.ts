import { TeamRepository } from '../repositories/teamRepository';
import { OrganizationRepository } from '../repositories/organizationRepository';
import { UserRepository } from '../repositories/userRepository';
import { Team, TeamMember } from '../models/types';

export class TeamService {
  private teamRepo: TeamRepository;
  private orgRepo: OrganizationRepository;
  private userRepo: UserRepository;

  constructor() {
    this.teamRepo = new TeamRepository();
    this.orgRepo = new OrganizationRepository();
    this.userRepo = new UserRepository();
  }

  async createTeam(data: {
    organization_id: string;
    name: string;
    description?: string;
  }): Promise<Team | null> {
    // Validate organization exists
    const organization = await this.orgRepo.findById(data.organization_id);
    if (!organization) {
      throw new Error('Organization not found');
    }

    return this.teamRepo.create(data);
  }

  async getTeams(organizationId?: string): Promise<Team[]> {
    if (organizationId) {
      return this.teamRepo.findByOrganization(organizationId);
    }
    return this.teamRepo.findAll();
  }

  async getTeamById(id: string): Promise<Team | null> {
    return this.teamRepo.findById(id);
  }

  async updateTeam(
    id: string,
    updates: Partial<Pick<Team, 'name' | 'description'>>
  ): Promise<Team | null> {
    const team = await this.teamRepo.findById(id);
    if (!team) {
      return null;
    }
    return this.teamRepo.update(id, updates);
  }

  async deleteTeam(id: string): Promise<boolean> {
    const team = await this.teamRepo.findById(id);
    if (!team) {
      return false;
    }
    return this.teamRepo.delete(id);
  }

  async addTeamMember(
    teamId: string,
    userId: string,
    role: 'team_lead' | 'developer'
  ): Promise<TeamMember | null> {
    // Validate team exists
    const team = await this.teamRepo.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Validate user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already a member
    const isMember = await this.teamRepo.isMember(teamId, userId);
    if (isMember) {
      throw new Error('User is already a team member');
    }

    return this.teamRepo.addMember(teamId, userId, role);
  }

  async removeTeamMember(teamId: string, userId: string): Promise<boolean> {
    const team = await this.teamRepo.findById(teamId);
    if (!team) {
      return false;
    }

    return this.teamRepo.removeMember(teamId, userId);
  }

  async getTeamMembers(teamId: string): Promise<any[]> {
    const team = await this.teamRepo.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    return this.teamRepo.getMembers(teamId);
  }
}
