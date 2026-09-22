declare module 'sib-api-v3-sdk' {
  export class ApiClient {
    static instance: ApiClient;
    authentications: {
      'api-key': {
        apiKey: string;
      };
    };
  }

  export class ContactsApi {
    addContactToList(listId: number, contactEmails: AddContactToList): Promise<unknown>;
    createContact(createContact: CreateContact): Promise<unknown>;
  }

  export class AddContactToList {
    emails: string[];
  }

  export class CreateContact {
    email: string;
    listIds?: number[];
    attributes?: Record<string, unknown>;
  }
}
