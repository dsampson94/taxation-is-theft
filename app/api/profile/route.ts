import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  occupation: true,
  taxNumber: true,
  idNumber: true,
  dateOfBirth: true,
  entityType: true,
  planType: true,
  credits: true,
  employmentType: true,
  hasMedicalAid: true,
  medicalAidMembers: true,
  monthlyMedicalAidFee: true,
  hasRetirementAnnuity: true,
  annualRAContribution: true,
  worksFromHome: true,
  homeOfficePct: true,
  usesVehicleForWork: true,
  annualBusinessKm: true,
  receivesTravelAllowance: true,
  makesDonations: true,
  hasOutOfPocketMedical: true,
  taxProfileComplete: true,
};

// GET /api/profile
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: PROFILE_SELECT,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH /api/profile
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    // Whitelist allowed fields
    const allowedFields = [
      'name', 'occupation', 'taxNumber', 'entityType', 'dateOfBirth',
      'employmentType', 'hasMedicalAid', 'medicalAidMembers', 'monthlyMedicalAidFee',
      'hasRetirementAnnuity', 'annualRAContribution', 'worksFromHome', 'homeOfficePct',
      'usesVehicleForWork', 'annualBusinessKm', 'receivesTravelAllowance',
      'makesDonations', 'hasOutOfPocketMedical', 'taxProfileComplete',
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    // Clamp numeric fields to valid ranges
    if (typeof data.homeOfficePct === 'number') {
      data.homeOfficePct = Math.min(100, Math.max(0, data.homeOfficePct as number));
    }
    if (typeof data.medicalAidMembers === 'number') {
      data.medicalAidMembers = Math.max(0, Math.round(data.medicalAidMembers as number));
    }
    if (typeof data.annualBusinessKm === 'number') {
      data.annualBusinessKm = Math.max(0, Math.round(data.annualBusinessKm as number));
    }
    if (data.monthlyMedicalAidFee !== undefined && data.monthlyMedicalAidFee !== null) {
      data.monthlyMedicalAidFee = Math.max(0, Number(data.monthlyMedicalAidFee));
    }
    if (data.annualRAContribution !== undefined && data.annualRAContribution !== null) {
      data.annualRAContribution = Math.max(0, Number(data.annualRAContribution));
    }

    const updated = await prisma.user.update({
      where: { id: authUser.userId },
      data,
      select: PROFILE_SELECT,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
