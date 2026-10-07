import { httpClient } from '../api/http-client'

export type EnquiryIntent = 'membership' | 'personal_training'

export interface WebsiteEnquiryPayload {
  full_name: string
  phone_number: string
  email?: string
  intent: EnquiryIntent
  plan_interest?: string
}

export interface WebsiteEnquiryResponse {
  message: string
  enquiry_id: number
}

export const publicService = {
  submitEnquiry: (payload: WebsiteEnquiryPayload) =>
    httpClient.post<WebsiteEnquiryResponse>('/public/enquiries', payload),
}
