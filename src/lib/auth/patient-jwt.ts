import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface PatientJWTPayload {
  intervention_id: string;
  patient_id: string;
  clinic_id: string;
}

export async function signPatientJWT(
  payload: PatientJWTPayload,
  expiresInDays: number = 90
): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInDays}d`)
    .sign(secret);
}

export async function verifyPatientJWT(
  token: string
): Promise<PatientJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as PatientJWTPayload;
  } catch {
    return null;
  }
}

export const PATIENT_COOKIE_NAME = "capilex_session";
