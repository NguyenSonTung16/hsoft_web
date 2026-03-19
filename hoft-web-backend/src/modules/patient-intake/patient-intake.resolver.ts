import { GraphQLError } from "graphql";

import {
	CreatePatientMutationArgs,
} from "./patient-intake.types";
import {
	createPatientIntakeService,
	patientIntakeService,
} from "./patient-intake.service";

interface ResolverContext {
	sessionToken?: string;
}

interface PatientIntakeResolverDeps {
	service: ReturnType<typeof createPatientIntakeService>;
}

const defaultDeps: PatientIntakeResolverDeps = {
	service: patientIntakeService,
};

// Guard resolver entrypoints that require an authenticated session token.
function ensureSessionToken(context: ResolverContext): void {
	if (!context?.sessionToken?.trim()) {
		throw new GraphQLError("Missing or invalid bearer token", {
			extensions: { code: "UNAUTHENTICATED" },
		});
	}
}

// Build the GraphQL resolver object for patient-intake mutations.
export function createPatientIntakeResolver(
	deps: PatientIntakeResolverDeps = defaultDeps
) {
	return {
		Mutation: {
			// Validate request shape at API layer, then delegate business logic to service.
			createPatient: async (
				_: unknown,
				args: CreatePatientMutationArgs,
				context: ResolverContext
			) => {
				ensureSessionToken(context);

				const input = args?.input;
				if (!input) {
					throw new GraphQLError("input is required", {
						extensions: { code: "BAD_USER_INPUT" },
					});
				}

				const requiredFields: Array<keyof CreatePatientMutationArgs["input"]> = [
					"hoTen",
					"ngaySinh",
					"gioiTinh",
					"loaiBenhNhan",
					"doiTuong",
				];

				const missingField = requiredFields.find(
					(field) => !input[field]?.trim()
				);

				if (missingField) {
					throw new GraphQLError(`${missingField} is required`, {
						extensions: { code: "BAD_USER_INPUT" },
					});
				}

				return deps.service.createPatient(input);
			},
		},
	};
}

// Default resolver instance used by Apollo schema registration.
export const patientIntakeResolver = createPatientIntakeResolver();
