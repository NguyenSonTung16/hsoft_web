import type { FacilityOption, LabAreaOption, LoginRequestDraft } from '../types/login.types'

export interface LoginResponseContract {
  success: boolean
  session?: {
    sessionToken?: string
    expiresAt?: string
    facilityId?: string
    labAreaId?: string
    workDate?: string
    reauthRequired: boolean
  }
  errors: Array<{ code: string; message: string }>
}

export interface LoginServiceContract {
  loadFacilities(): Promise<FacilityOption[]>
  loadLabAreas(facilityId: string): Promise<LabAreaOption[]>
  submitLogin(payload: LoginRequestDraft): Promise<LoginResponseContract>
}

interface GraphQLErrorItem {
  message?: string
  extensions?: {
    code?: string
  }
}

async function requestGraphQL<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`)
  }

  const result = await response.json() as {
    data?: TData
    errors?: GraphQLErrorItem[]
  }

  if (result.errors?.length) {
    const firstError = result.errors[0]
    throw new Error(firstError?.message || firstError?.extensions?.code || 'GRAPHQL_ERROR')
  }

  if (!result.data) {
    throw new Error('EMPTY_GRAPHQL_DATA')
  }

  return result.data
}

class LoginGraphQLService implements LoginServiceContract {
  async loadFacilities(): Promise<FacilityOption[]> {
    const data = await requestGraphQL<{
      loadFacilities: Array<{
        id: string
        code: string
        name: string
      }>
    }>(`
      query LoadFacilities {
        loadFacilities {
          id
          code
          name
        }
      }
    `)

    return (data.loadFacilities || []).map((facility) => ({
      id: facility.id,
      code: facility.code,
      name: facility.name,
      isActive: true,
    }))
  }

  async loadLabAreas(facilityId: string): Promise<LabAreaOption[]> {
    const data = await requestGraphQL<{
      loadLabAreas: Array<{
        id: string
        code: string
        name: string
      }>
    }>(
      `
        query LoadLabAreas($facilityId: ID!) {
          loadLabAreas(facilityId: $facilityId) {
            id
            code
            name
          }
        }
      `,
      { facilityId },
    )

    return (data.loadLabAreas || []).map((labArea) => ({
      id: labArea.id,
      facilityId,
      code: labArea.code,
      name: labArea.name,
      isActive: true,
    }))
  }

  async submitLogin(payload: LoginRequestDraft): Promise<LoginResponseContract> {
    try {
      const data = await requestGraphQL<{
        submitLogin: {
          status: 'success' | 'error'
          message: string
          session: {
            sessionToken?: string
            expiresAt?: string
            facilityId?: string
            labAreaId?: string
            workDate?: string
            reauthRequired: boolean
          } | null
        }
      }>(
        `
          mutation SubmitLogin($input: LoginInput!) {
            submitLogin(input: $input) {
              status
              message
              session {
                sessionToken
                expiresAt
                facilityId
                labAreaId
                workDate
                reauthRequired
              }
            }
          }
        `,
        { input: payload },
      )

      const loginResult = data.submitLogin
      if (loginResult?.status === 'success') {
        return {
          success: true,
          session: loginResult.session ?? undefined,
          errors: [],
        }
      }

      return {
        success: false,
        errors: [
          {
            code: 'AUTH_FAILED',
            message: loginResult?.message || 'Đăng nhập thất bại.',
          },
        ],
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: 'NETWORK_OR_SERVER_ERROR',
            message: error instanceof Error
              ? error.message
              : 'Không thể kết nối server.',
          },
        ],
      }
    }
  }
}

export const loginService: LoginServiceContract = new LoginGraphQLService()
