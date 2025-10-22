const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Program item interface
 */
interface ProgramItem {
  id: number;
  program_name: string;
  program_type: string | null;
  target_group: string | null;
  description: string | null;
  is_online_available: boolean;
  is_free: boolean;
  fee_amount: number | null;
  capacity: number | null;
  duration_minutes: number | null;
}

/**
 * Program filters interface
 */
interface ProgramFilters {
  target_group?: string;
  is_online?: boolean;
  is_free?: boolean;
}

/**
 * Pagination interface
 */
interface Pagination {
  page?: number;
  limit?: number;
}

/**
 * Program response interface
 */
interface ProgramResponse {
  center_id: number;
  programs: ProgramItem[];
  total_count: number;
  has_data: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Get center programs with optional filters and pagination
 *
 * @param centerId - Center ID
 * @param filters - Optional filters (target_group, is_online, is_free)
 * @param pagination - Optional pagination (page, limit)
 * @returns Program list with pagination info
 *
 * @example
 * const programs = await getCenterPrograms(1, { is_online: true }, { page: 1, limit: 10 });
 */
async function getCenterPrograms(
  centerId: number,
  filters: ProgramFilters = {},
  pagination: Pagination = {}
): Promise<ProgramResponse> {
  try {
    const { target_group, is_online, is_free } = filters;
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      centerId: BigInt(centerId),
      isActive: true,
    };

    if (target_group !== undefined) {
      where.targetGroup = target_group;
    }

    if (is_online !== undefined) {
      where.isOnlineAvailable = is_online;
    }

    if (is_free !== undefined) {
      where.isFree = is_free;
    }

    // Execute queries in parallel
    const [programs, totalCount] = await Promise.all([
      prisma.centerProgram.findMany({
        where,
        select: {
          id: true,
          programName: true,
          programType: true,
          targetGroup: true,
          description: true,
          isOnlineAvailable: true,
          isFree: true,
          feeAmount: true,
          capacity: true,
          durationMinutes: true,
        },
        orderBy: [
          { createdAt: 'desc' },
        ],
        take: limit,
        skip,
      }),
      prisma.centerProgram.count({ where }),
    ]);

    // Transform the data to match API response format
    const programItems: ProgramItem[] = programs.map((item) => ({
      id: Number(item.id),
      program_name: item.programName,
      program_type: item.programType,
      target_group: item.targetGroup,
      description: item.description,
      is_online_available: item.isOnlineAvailable,
      is_free: item.isFree,
      fee_amount: item.feeAmount ? Number(item.feeAmount) : null,
      capacity: item.capacity || null,
      duration_minutes: item.durationMinutes || null,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      center_id: centerId,
      programs: programItems,
      total_count: totalCount,
      has_data: programItems.length > 0,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching center programs:', error);
    throw error;
  }
}

module.exports = {
  getCenterPrograms,
};
