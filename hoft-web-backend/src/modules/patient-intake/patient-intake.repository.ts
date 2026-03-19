import oracledb from "oracledb";

import { getConnection } from "../../database/oracle";
import {
	CreatePatientRepositoryInput,
	CreatePatientRepositoryPort,
	CreatePatientResult,
} from "./patient-intake.types";

interface GuidRow {
	ID: string;
}

export class PatientIntakeRepository implements CreatePatientRepositoryPort {
	async createPatientTransaction(
		input: CreatePatientRepositoryInput
	): Promise<CreatePatientResult> {
		let connection: oracledb.Connection | undefined;

		try {
			connection = await getConnection();

			const idResult = await connection.execute<GuidRow>(
				`SELECT RAWTOHEX(SYS_GUID()) AS ID FROM DUAL`,
				{},
				{ outFormat: oracledb.OUT_FORMAT_OBJECT }
			);

			const patientId =
				(idResult.rows as GuidRow[] | undefined)?.[0]?.ID ?? "";

			if (!patientId) {
				throw new Error("PATIENT_ID_GENERATION_FAILED");
			}

			// NOTE: Column names here follow a conventional mapping for initial scaffolding.
			// Align names/types with the real Oracle schema before production rollout.
			await connection.execute(
				`
					INSERT INTO BTDBN (
						ID,
						MA_BN,
						HO_TEN,
						NGAY_SINH,
						GIOI_TINH,
						SO_THE_BHYT,
						CREATED_AT,
						UPDATED_AT
					) VALUES (
						:id,
						:maBn,
						:hoTen,
						TO_DATE(:ngaySinh, 'YYYY-MM-DD'),
						:gioiTinh,
						:soTheBHYT,
						SYSTIMESTAMP,
						SYSTIMESTAMP
					)
				`,
				{
					id: patientId,
					maBn: input.maBn,
					hoTen: input.hoTen,
					ngaySinh: input.ngaySinh,
					gioiTinh: input.gioiTinh,
					soTheBHYT: input.soTheBHYT ?? null,
				},
				{ autoCommit: false }
			);

			await connection.execute(
				`
					INSERT INTO HANHCHANH (
						ID,
						PATIENT_ID,
						MA_BN,
						DIA_CHI,
						SO_DIEN_THOAI,
						LOAI_BENH_NHAN,
						DOI_TUONG,
						CREATED_AT,
						UPDATED_AT
					) VALUES (
						RAWTOHEX(SYS_GUID()),
						:patientId,
						:maBn,
						:diaChi,
						:soDienThoai,
						:loaiBenhNhan,
						:doiTuong,
						SYSTIMESTAMP,
						SYSTIMESTAMP
					)
				`,
				{
					patientId,
					maBn: input.maBn,
					diaChi: input.diaChi ?? null,
					soDienThoai: input.soDienThoai ?? null,
					loaiBenhNhan: input.loaiBenhNhan,
					doiTuong: input.doiTuong,
				},
				{ autoCommit: false }
			);

			await connection.commit();

			return {
				patientId,
				maBn: input.maBn,
				createdAt: input.createdAt,
			};
		} catch (error) {
			try {
				await connection?.rollback();
			} catch {
				// Best effort rollback.
			}
			throw error;
		} finally {
			await connection?.close();
		}
	}
}
