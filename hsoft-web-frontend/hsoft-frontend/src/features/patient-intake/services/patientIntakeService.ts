import { getGraphQLEndpoint } from "../../../shared/graphqlEndpoint";

import type {
	CreatePatientInput,
	CreatePatientMutationData,
	CreatePatientMutation,
	CreatePatientResult,
} from "../types/patient-intake.types";

interface GraphQLErrorItem {
	message?: string;
}

async function requestGraphQL<TData>(
	sessionToken: string,
	query: string,
	variables?: Record<string, unknown>
): Promise<TData> {
	const response = await fetch(getGraphQLEndpoint(), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${sessionToken}`,
		},
		body: JSON.stringify({ query, variables }),
	});

	const result = (await response.json()) as {
		data?: TData;
		errors?: GraphQLErrorItem[];
	};

	if (!response.ok || result.errors?.length || !result.data) {
		throw new Error(result.errors?.[0]?.message || `HTTP_${response.status}`);
	}

	return result.data;
}

export interface PatientIntakeService {
	createPatient(sessionToken: string, input: CreatePatientInput): Promise<CreatePatientResult>;
}

class GraphQLPatientIntakeService implements PatientIntakeService {
	async createPatient(sessionToken: string, input: CreatePatientInput): Promise<CreatePatientResult> {
		const data = await requestGraphQL<CreatePatientMutationData>(
			sessionToken,
			`
				mutation CreatePatient($input: CreatePatientInput!) {
					createPatient(input: $input) {
						patientId
						maBn
						createdAt
					}
				}
			`,
			{ input } satisfies CreatePatientMutation
		);

		return data.createPatient;
	}
}

export const patientIntakeService: PatientIntakeService = new GraphQLPatientIntakeService();
