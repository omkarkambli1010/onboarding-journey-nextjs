import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import aesService from './aes.service';
import { moengagesdkService } from './moengagesdk.service';
import { toast } from 'react-toastify';

// Equivalent to Angular's environment import
const backendurl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://udn.sbisecurities.in/';

// API Service — equivalent to Angular APIService
// Handles all HTTP communication with AES-encrypted payloads

class APIService {
  private routeurl: string = backendurl;

  api: string = this.routeurl + 'diypwaapi/';
  esignapi: string = this.routeurl + 'EsignService/api/v1/esignstamp/getEsignPDFData';
  nomineeapi: string = this.routeurl + 'NomineeOptOutService/api/v1/nomineeservice/';
  msfapi: string = this.routeurl + 'msfpwaapi/';

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
