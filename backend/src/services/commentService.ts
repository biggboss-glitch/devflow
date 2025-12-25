import { CommentRepository } from '../repositories/commentRepository';
import { Comment } from '../models/types';

export class CommentService {
  private commentRepo: CommentRepository;

  constructor() {
    this.commentRepo = new CommentRepository();
  }

  async createComment(data: {
    task_id: string;
    user_id: string;
    content: string;
  }): Promise<Comment> {
    return this.commentRepo.create(data);
  }

  async getCommentsByTask(taskId: string): Promise<Comment[]> {
    return this.commentRepo.findByTask(taskId);
  }

  async updateComment(id: string, content: string, userId: string): Promise<Comment | null> {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      return null;
    }

    // Check if user owns the comment
    if (comment.user_id !== userId) {
      throw new Error('Unauthorized to edit this comment');
    }

    return this.commentRepo.update(id, content);
  }

  async deleteComment(id: string, userId: string, isAdmin: boolean): Promise<boolean> {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      return false;
    }

    // Check if user owns the comment or is admin
    if (comment.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this comment');
    }

    return this.commentRepo.softDelete(id);
  }
}
