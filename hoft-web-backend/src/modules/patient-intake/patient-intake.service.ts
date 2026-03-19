import { GraphQLError } from "graphql";
import {
  CreatePatientInput,
  CreatePatientRepositoryInput,
  CreatePatientRepositoryPort,
  CreatePatientResult,
} from "./patient-intake.types";
import { PatientIntakeRepository } from "./patient-intake.repository";

interface PatientIntakeServiceDeps {
  repository: CreatePatientRepositoryPort;
  nowFactory: () => Date;
  maBnFactory: (now: Date) => string;
}

const phoneRegex = /^(0|\+84)\d{9,10}$/;
const bhytRegex = /^[A-Z0-9]{8,20}$/i;

// Throw a standardized GraphQL validation error for client input issues.
function badUserInput(message: string, field?: string): never {
  throw new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      field,
    },
  });
}

// Normalize and trim user input before business validation and persistence.
function normalizeInput(input: CreatePatientInput): CreatePatientInput {
  return {
    maBn: input.maBn?.trim() || undefined,
    hoTen: input.hoTen?.trim(),
    ngaySinh: input.ngaySinh?.trim(),
    gioiTinh: input.gioiTinh?.trim().toLowerCase(),
    diaChi: input.diaChi?.trim(),
    soDienThoai: input.soDienThoai?.trim(),
    soTheBHYT: input.soTheBHYT?.trim().toUpperCase(),
    loaiBenhNhan: input.loaiBenhNhan?.trim().toLowerCase(),
    doiTuong: input.doiTuong?.trim().toLowerCase(),
  };
}

// Validate required fields and format constraints for intake request payload.
function validateBusiness(input: CreatePatientInput): void {
  if (!input.hoTen) badUserInput("hoTen is required", "hoTen");
  if (!input.ngaySinh) badUserInput("ngaySinh is required", "ngaySinh");
  if (!input.gioiTinh) badUserInput("gioiTinh is required", "gioiTinh");
  if (!input.loaiBenhNhan) badUserInput("loaiBenhNhan is required", "loaiBenhNhan");
  if (!input.doiTuong) badUserInput("doiTuong is required", "doiTuong");

  if (input.soDienThoai && !phoneRegex.test(input.soDienThoai)) {
    badUserInput("soDienThoai is invalid", "soDienThoai");
  }

  if (input.soTheBHYT && !bhytRegex.test(input.soTheBHYT)) {
    badUserInput("soTheBHYT is invalid", "soTheBHYT");
  }
}

// Convert validated input into repository contract with generated values.
function mapToRepositoryInput(
  input: CreatePatientInput,
  maBn: string,
  createdAt: string
): CreatePatientRepositoryInput {
  return {
    maBn,
    hoTen: input.hoTen!,
    ngaySinh: input.ngaySinh!,
    gioiTinh: input.gioiTinh!,
    diaChi: input.diaChi,
    soDienThoai: input.soDienThoai,
    soTheBHYT: input.soTheBHYT,
    loaiBenhNhan: input.loaiBenhNhan!,
    doiTuong: input.doiTuong!,
    createdAt,
  };
}

// Detect Oracle unique-key violations related to patient code generation.
function isUniqueMaBnError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("ORA-00001") || message.includes("UQ_") || message.includes("MA_BN");
}

// Compose patient-intake service with validation, code generation, and error mapping.
export function createPatientIntakeService(deps: PatientIntakeServiceDeps) {
  return {
    async createPatient(input: CreatePatientInput): Promise<CreatePatientResult> {
      const clean = normalizeInput(input);
      validateBusiness(clean);

      const now = deps.nowFactory();
      const maBn = clean.maBn || deps.maBnFactory(now);
      const createdAt = now.toISOString();

      try {
        return await deps.repository.createPatientTransaction(
          mapToRepositoryInput(clean, maBn, createdAt)
        );
      } catch (error) {
        if (isUniqueMaBnError(error)) {
          throw new GraphQLError("Ma BN already exists", {
            extensions: {
              code: "BAD_USER_INPUT",
              field: "maBn",
            },
          });
        }

        throw new GraphQLError("Create patient failed", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  };
}

// Generate a fallback patient code when the client does not provide one.
export const defaultMaBnFactory = (now: Date): string => {
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random5 = Math.floor(Math.random() * 90000 + 10000);
  return `BN${y}${m}${d}${random5}`;
};

export const patientIntakeService = createPatientIntakeService({
  repository: new PatientIntakeRepository(),
  nowFactory: () => new Date(),
  maBnFactory: defaultMaBnFactory,
});