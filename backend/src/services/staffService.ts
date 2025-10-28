import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Staff response interface
 */
interface StaffItem {
  staff_type: string;
  staff_count: number;
  description: string | null;
}

interface StaffResponse {
  center_id: number;
  staff: StaffItem[];
  total_staff: number;
  has_data: boolean;
}

/**
 * Get center staff information
 *
 * @param centerId - Center ID
 * @returns Staff information with total count
 *
 * @example
 * const staffData = await getCenterStaff(1);
 * // Returns: { center_id: 1, staff: [...], total_staff: 12, has_data: true }
 */
async function getCenterStaff(centerId: number): Promise<StaffResponse> {
  try {
    // Query staff data ordered by display_order
    const staff = await prisma.centerStaff.findMany({
      where: {
        centerId: BigInt(centerId),
      },
      select: {
        staffType: true,
        staffCount: true,
        description: true,
      },
      orderBy: {
        id: 'asc', // Using id as proxy for display_order since schema doesn't have display_order field
      },
    });

    // Transform the data to match API response format
    const staffItems: StaffItem[] = staff.map((item: any) => ({
      staff_type: item.staffType,
      staff_count: item.staffCount,
      description: item.description,
    }));

    // Calculate total staff count
    const totalStaff = staffItems.reduce((sum, item) => sum + item.staff_count, 0);

    return {
      center_id: centerId,
      staff: staffItems,
      total_staff: totalStaff,
      has_data: staffItems.length > 0,
    };
  } catch (error) {
    console.error('Error fetching center staff:', error);
    throw error;
  }
}

module.exports = {
  getCenterStaff,
};
