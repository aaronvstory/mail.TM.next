const MAIL_TM_API = "https://api.mail.tm";

export interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
}

export interface MailTmAccount {
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  accountId: string;
  msgid: string;
  from: { address: string; name?: string };
  to: Array<{ address: string; name?: string }>;
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
  text?: string;
  html?: string;
}

export interface MailTmError {
  type: string;
  title: string;
  detail: string;
  "hydra:description"?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("mail_tm_token="))
          ?.split("=")[1]
      : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function checkAuth(): Promise<boolean> {
  const token =
    typeof window !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("mail_tm_token="))
          ?.split("=")[1]
      : null;
  return !!token;
}

export async function getAvailableDomains(): Promise<Domain[]> {
  const response = await fetch(`${MAIL_TM_API}/domains`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error["hydra:description"] || "Failed to fetch domains");
  }

  const data = await response.json();
  return data["hydra:member"];
}

export async function createMailTmAccount(
  username: string,
  password: string,
  domain: string
): Promise<MailTmAccount> {
  const response = await fetch(`${MAIL_TM_API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: `${username}@${domain}`,
      password: password,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data["hydra:description"] || data.message;
    if (errorMessage?.includes("already exists")) {
      throw new Error(
        "This username is already taken. Please try another one."
      );
    }
    throw new Error(errorMessage || "Failed to create account");
  }

  return data;
}

export async function loginMailTm(address: string, password: string) {
  try {
    const fullAddress = address.includes("@") ? address : `${address}@mail.tm`;
    const response = await fetch(`${MAIL_TM_API}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: fullAddress, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Invalid email or password. Please check your credentials."
        );
      }
      throw new Error(
        data["hydra:description"] || data.message || "Failed to login"
      );
    }

    // Get account details after successful login
    const accountResponse = await fetch(`${MAIL_TM_API}/me`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        "Content-Type": "application/json",
      },
    });
    const accountData = await accountResponse.json();

    if (typeof window !== "undefined") {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `mail_tm_token=${data.token}; path=/; expires=${expires}`;
      document.cookie = `mail_tm_account=${JSON.stringify({
        id: accountData.id,
        email: fullAddress,
      })}; path=/; expires=${expires}`;
    }

    return {
      ...data,
      account: accountData,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logout() {
  if (typeof window !== "undefined") {
    document.cookie =
      "mail_tm_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "mail_tm_account=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export async function getMessages(
  page = 1,
  itemsPerPage = 20
): Promise<{ messages: Message[]; total: number }> {
  const response = await fetch(
    `${MAIL_TM_API}/messages?page=${page}&pageSize=${itemsPerPage}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  const data = await response.json();
  return {
    messages: data["hydra:member"],
    total: data["hydra:totalItems"],
  };
}

export async function getMessage(id: string): Promise<Message> {
  const response = await fetch(`${MAIL_TM_API}/messages/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch message");
  }

  return response.json();
}
