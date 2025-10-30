// src/services/gmail/gmail.api.ts
import { http } from "../http/client";

/* ============================================================================
 * Gmail API Service
 * - Handles fetching Gmail folders and emails
 * - Supports both API and mock data for development
 * ========================================================================== */

export interface GmailFolder {
    id: string;
    name: string;
    messageCount?: number;
}

export interface GmailLabel {
    id: string;
    name: string;
    type: string;
    messageListVisibility?: string;
    labelListVisibility?: string;
    messageCount?: number;
}

export interface GmailEmail {
    id: string;
    title: string;
    sender: string;
    datetime: string;
    folder?: string;
    subject?: string;
    from_name?: string;
    from_email?: string;
    body_plain?: string;
    body_html?: string;
    received_date?: string;
}

export interface GmailFoldersResponse {
    status?: string;
    data?: {
        labels?: GmailLabel[];
    };
    folders?: GmailLabel[];
    labels?: GmailLabel[];
}

export interface GmailEmailsResponse {
    status?: string;
    data?: {
        emails: GmailEmail[];
        total?: number;
    };
    emails?: GmailEmail[];
    total?: number;
}

const BASE = "/gmail";

/**
 * Fetch available Gmail folders for the connected account
 */
export async function fetchGmailFolders(authCode?: string): Promise<GmailFoldersResponse> {
    console.log('[GmailAPI] fetchGmailFolders() called', authCode ? 'with auth code' : 'without auth code');

    try {
        const params = authCode ? `?auth_code=${encodeURIComponent(authCode)}` : '';
        const response = await http<GmailFoldersResponse>(`${BASE}/folders${params}`, {
            method: "GET"
        });

        console.log('[GmailAPI] Folders fetched successfully:', response);

        // Normalize response to always expose "labels"
        const labels =
            response?.data?.labels ||
            response?.labels ||
            response?.folders ||
            [];

        return {
            ...response,
            data: {
                ...(response?.data || {}),
                labels,
            },
            labels,
            folders: labels,
        };
    } catch (error) {
        console.error('[GmailAPI] Error fetching folders:', error);
        // Return default folders on error
        const fallbackLabels: GmailLabel[] = [
            { id: 'INBOX', name: 'INBOX', type: 'system' },
            { id: 'SENT', name: 'SENT', type: 'system' },
            { id: 'DRAFT', name: 'DRAFT', type: 'system' },
            { id: 'SPAM', name: 'SPAM', type: 'system' },
            { id: 'TRASH', name: 'TRASH', type: 'system' }
        ];

        return {
            status: "error",
            data: {
                labels: fallbackLabels
            },
            labels: fallbackLabels,
            folders: fallbackLabels
        };
    }
}

/**
 * Fetch recent emails from a specific Gmail folder
 */
export async function fetchGmailEmails(
    folder: string,
    authCode?: string,
    limit: number = 10
): Promise<GmailEmailsResponse> {
    console.log('[GmailAPI] fetchGmailEmails() called for folder:', folder);

    try {
        const params = new URLSearchParams();
        params.set('folder', folder);
        params.set('limit', String(limit));
        if (authCode) {
            params.set('auth_code', authCode);
        }

        const response = await http<GmailEmailsResponse>(`${BASE}/emails?${params.toString()}`, {
            method: "GET"
        });

        console.log('[GmailAPI] Emails fetched successfully:', response);

        const rawEmails: any[] =
            (response?.data as any)?.emails ||
            response?.emails ||
            [];

        const normalizedEmails: GmailEmail[] = rawEmails.map((email: any, index: number) => {
            const title = email?.title || email?.subject || email?.body_plain || "(No title)";
            const sender =
                email?.sender ||
                (email?.from_name && email?.from_email ? `${email.from_name} <${email.from_email}>` : email?.from_email) ||
                email?.from_name ||
                "Unknown sender";
            const datetime = email?.datetime || email?.received_date || new Date().toISOString();

            return {
                id: email?.id || email?.messageId || `email-${index}`,
                title,
                sender,
                datetime,
                folder: email?.folder,
                subject: email?.subject,
                from_name: email?.from_name,
                from_email: email?.from_email,
                body_plain: email?.body_plain,
                body_html: email?.body_html,
                received_date: email?.received_date
            };
        });

        const normalizedResponse: GmailEmailsResponse = {
            status: response?.status ?? "ok",
            data: {
                emails: normalizedEmails,
                total: response?.data?.total ?? normalizedEmails.length
            },
            emails: normalizedEmails,
            total: response?.total ?? normalizedEmails.length
        };

        return normalizedResponse;
    } catch (error) {
        console.error('[GmailAPI] Error fetching emails:', error);
        // Return mock data on error
        return {
            status: "error",
            data: {
                emails: [],
                total: 0
            },
            emails: [],
            total: 0
        };
    }
}

export const gmailApiService = {
    fetchFolders: fetchGmailFolders,
    fetchEmails: fetchGmailEmails,
};
