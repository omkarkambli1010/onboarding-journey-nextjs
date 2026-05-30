import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import aesService from './aes.service';
import { moengagesdkService } from './moengagesdk.service';
import { toast } from '@/services/toast.service';

// Equivalent to Angular's environment import
const backendurl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://udn.sbisecurities.in/';

// ── NRI API base URL ─────────────────────────────────────────────────────────
// Comment out the option you are NOT using (only one may be active at a time).

// udn — call the backend directly (ACTIVE):
const nriBackendurl = process.env.NEXT_PUBLIC_NRI_BACKEND_URL ?? 'https://udn.sbisecurities.in/nriapi';

// localhost — same-origin proxy in dev to avoid browser CORS and follow backend
// 307s server-side via src/app/nriapi/[...path]/route.ts (direct backend in prod):
// const nriBackendurl =
//   process.env.NEXT_PUBLIC_NRI_BACKEND_URL ??
//   (process.env.NODE_ENV === 'development' ? '/nriapi' : 'https://udn.sbisecurities.in/nriapi');
// ─────────────────────────────────────────────────────────────────────────────

// API Service — equivalent to Angular APIService
// Handles all HTTP communication with AES-encrypted payloads

class APIService {
  private routeurl: string = backendurl;
  private nriRouteurl: string = nriBackendurl;

  api: string = this.routeurl + 'diypwaapi/';
  esignapi: string = this.routeurl + 'EsignService/api/v1/esignstamp/getEsignPDFData';
  nomineeapi: string = this.routeurl + 'NomineeOptOutService/api/v1/nomineeservice/';
  msfapi: string = this.routeurl + 'msfpwaapi/';
  nriapi: string = this.nriRouteurl + '/api/v1/';

  private getHeaders(withAuth = true) {
    const client_id =
      typeof window !== 'undefined' ? window.sessionStorage.getItem('clientid') ?? '' : '';
    const token =
      typeof window !== 'undefined' ? window.sessionStorage.getItem('token') : null;

    const headers: Record<string, string> = {
      client_id: client_id || 'no-client',
    };

    if (withAuth && token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    return headers;
  }

  private getClientId(): string {
    return typeof window !== 'undefined'
      ? window.sessionStorage.getItem('clientid') ?? ''
      : '';
  }

  private encryptPayload(data: any): { request: string } {
    const client_id = this.getClientId();
    return {
      request: aesService.encrypt(JSON.stringify(data), client_id, client_id),
    };
  }

  private decryptResponse(response: AxiosResponse): any {
    const client_id = this.getClientId();
    const rawData = response.data;
    if (rawData?.response) {
      try {
        const decrypted = aesService.decrypt(rawData.response, client_id, client_id);
        return JSON.parse(decrypted);
      } catch {
        return rawData;
      }
    }
    return rawData;
  }

  private removeModal() {
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
      document.body.classList.remove('modal-open');
    }
  }

  private handleError(error: any, hideSpinner?: () => void) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;

    const msg =
      (errorData?.message ?? '') ||
      (errorData?.Message ?? '') ||
      (errorData?.detail ?? '') || // NRI API surfaces the message in `detail`
      '';

    const formNumber =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem('FormNumber') ?? ''
        : '';

    const trackError = (errMsg: string, code: number) => {
      moengagesdkService.trackEvent('General Errors', {
        product_id: formNumber,
        product_name: 'Onboarding DIY',
        category: 'Errors',
        ErrorMsg: errMsg,
        ErrorCode: code,
      });
    };

    const showError = (message: string) => {
      toast.error(
        message ||
          'Please check the internet connectivity. Still if the issue persists, please contact us at helpdesk@sbicapsec.com',
        { position: 'bottom-center', autoClose: 3500 }
      );
    };

    if (status === 400) {
      hideSpinner?.();
      showError(msg);
      trackError(msg, 400);
      this.removeModal();
    } else if (status === 401) {
      hideSpinner?.();
      const isUnauthorized = errorData == null || errorData?.ReasonPhrase === 'Unauthorized';

      if (isUnauthorized) {
        const alreadyShown = window.sessionStorage.getItem('Unauthorized');
        if (!alreadyShown) {
          toast.error('Session Expired...', {
            position: 'bottom-center',
            autoClose: 4500,
          });
        }
        trackError('Session Expired...', 401);
        window.sessionStorage.setItem('Unauthorized', 'Error Message Shown');
        setTimeout(() => {
          moengagesdkService.logoutUser();
          window.localStorage.clear();
          window.sessionStorage.clear();
          window.location.href = 'https://udn.sbisecurities.in/diy';
        }, 200);
      } else {
        showError(msg);
        trackError(msg, 401);
      }
      this.removeModal();
    } else if (status === 404) {
      toast.error('Details Not Found...', { position: 'bottom-center', autoClose: 3500 });
      trackError('Details Not Found...', 404);
      this.removeModal();
      hideSpinner?.();
    } else {
      hideSpinner?.();
      showError(msg);
      trackError(msg, status ?? 0);
      this.removeModal();
    }

    throw error;
  }

  async postRequest(controller: string, data: any, hideSpinner?: () => void): Promise<any> {
    const url = this.api + controller;
    const headers = this.getHeaders();
    const payload = this.encryptPayload(data);

    try {
      const response = await axios.post(url, payload, { headers });
      return this.decryptResponse(response);
    } catch (error) {
      return this.handleError(error, hideSpinner);
    }
  }

  async postRequestEsign(controller: string, data: any, hideSpinner?: () => void): Promise<any> {
    const url = this.esignapi;
    const payload = this.encryptPayload(data);

    try {
      const response = await axios.post(url, payload);
      return this.decryptResponse(response);
    } catch (error) {
      return this.handleError(error, hideSpinner);
    }
  }

  async postRequestNominee(controller: string, data: any, hideSpinner?: () => void): Promise<any> {
    const url = this.nomineeapi + controller;
    const headers = this.getHeaders();
    const payload = this.encryptPayload(data);

    try {
      const response = await axios.post(url, payload, { headers });
      return this.decryptResponse(response);
    } catch (error) {
      return this.handleError(error, hideSpinner);
    }
  }

  async postRequestMsf(controller: string, data: any, hideSpinner?: () => void): Promise<any> {
    const url = this.msfapi + controller;
    const headers = this.getHeaders();
    const payload = this.encryptPayload(data);

    try {
      const response = await axios.post(url, payload, { headers });
      return this.decryptResponse(response);
    } catch (error) {
      return this.handleError(error, hideSpinner);
    }
  }

  private generateIdempotencyKey(): string {
    const uuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `reg-001-${uuid}`;
  }

  // NRI API — sends raw (unencrypted) JSON. Used by registration and OTP endpoints.
  private async postNri(
    path: string,
    data: any,
    hideSpinner?: () => void,
    extraHeaders?: Record<string, string>,
  ): Promise<any> {
    const url = this.nriapi + path;
    const headers = { 'Content-Type': 'application/json', ...extraHeaders };

    try {
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error) {
      return this.handleError(error, hideSpinner);
    }
  }

  // Registration — requires an Idempotency-Key header.
  async registerUser(data: any, hideSpinner?: () => void): Promise<any> {
    return this.postNri('register', data, hideSpinner, {
      'Idempotency-Key': this.generateIdempotencyKey(),
    });
  }

  // Send an OTP for the given application/channel (e.g. "Sms", "WhatsApp").
  async sendNriOtp(applicationId: string, channel: string, hideSpinner?: () => void): Promise<any> {
    return this.postNri(`applications/${applicationId}/otp/send`, { channel }, hideSpinner);
  }

  // Verify the entered OTP code against the one sent for the application.
  async verifyNriOtp(
    applicationId: string,
    channel: string,
    code: string,
    hideSpinner?: () => void,
  ): Promise<any> {
    return this.postNri(`applications/${applicationId}/otp/verify`, { channel, code }, hideSpinner);
  }

  async getRequest(controller: string, hideSpinner?: () => void): Promise<any> {
    const url = this.api + controller;
    const headers = this.getHeaders();

    try {
      const response = await axios.get(url, { headers });
      return this.decryptResponse(response);
    } catch (error) {
      return this.handleError(error, hideSpinner);
    }
  }
}

export const apiService = new APIService();
export default apiService;
