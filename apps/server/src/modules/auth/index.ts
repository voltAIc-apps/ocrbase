import { auth } from "@ocrbase/auth";
import { Elysia } from "elysia";

/**
 * Forward request to Better Auth, preserving the body.
 * Elysia consumes the request body stream before handlers run,
 * so we need to read it and create a new Request with that body.
 */
const forwardToAuth = async ({
  request,
  body,
}: {
  request: Request;
  body: unknown;
}) => {
  // Create a new Request with the body that Elysia already parsed
  const newRequest = new Request(request.url, {
    body: body ? JSON.stringify(body) : undefined,
    headers: request.headers,
    method: request.method,
  });
  return auth.handler(newRequest);
};

/**
 * Forward GET requests to Better Auth.
 * Create a fresh Request to avoid any issues with consumed streams.
 */
const forwardGetToAuth = ({ request }: { request: Request }) => {
  const newRequest = new Request(request.url, {
    headers: request.headers,
    method: request.method,
  });
  return auth.handler(newRequest);
};

/**
 * Auth routes for OpenAPI documentation.
 * Uses parse: "json" to let Elysia parse body, then forwards to Better Auth.
 */
export const authRoutes = new Elysia({ prefix: "/api/auth" })
  // ============== Authentication ==============
  .post("/sign-up/email", forwardToAuth, {
    detail: {
      description: "Create a new account with email and password",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                email: { example: "user@example.com", type: "string" },
                name: { example: "John Doe", type: "string" },
                password: { example: "securepassword123", type: "string" },
              },
              required: ["email", "password", "name"],
              type: "object",
            },
          },
        },
      },
      tags: ["Auth"],
    },
    parse: "json",
  })
  .post("/sign-in/email", forwardToAuth, {
    detail: {
      description: "Sign in with email and password",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                email: { example: "user@example.com", type: "string" },
                password: { type: "string" },
              },
              required: ["email", "password"],
              type: "object",
            },
          },
        },
      },
      tags: ["Auth"],
    },
    parse: "json",
  })
  .post("/sign-in/social", forwardToAuth, {
    detail: {
      description: "Initiate social login (e.g., GitHub)",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                callbackURL: { type: "string" },
                provider: { example: "github", type: "string" },
              },
              required: ["provider"],
              type: "object",
            },
          },
        },
      },
      tags: ["Auth"],
    },
    parse: "json",
  })
  .post("/sign-out", forwardToAuth, {
    detail: {
      description: "Sign out and invalidate the current session",
      tags: ["Auth"],
    },
    parse: "json",
  })
  .get("/get-session", forwardGetToAuth, {
    detail: {
      description: "Get the current user session",
      tags: ["Auth"],
    },
  })
  .post("/forget-password", forwardToAuth, {
    detail: {
      description: "Request a password reset email",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                email: { example: "user@example.com", type: "string" },
              },
              required: ["email"],
              type: "object",
            },
          },
        },
      },
      tags: ["Auth"],
    },
    parse: "json",
  })
  .post("/reset-password", forwardToAuth, {
    detail: {
      description: "Reset password using a token from the reset email",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                newPassword: { type: "string" },
                token: { type: "string" },
              },
              required: ["token", "newPassword"],
              type: "object",
            },
          },
        },
      },
      tags: ["Auth"],
    },
    parse: "json",
  })
  .get("/verify-email", forwardGetToAuth, {
    detail: {
      description: "Verify email address using a token",
      tags: ["Auth"],
    },
  })

  // ============== Organization Management ==============
  .post("/organization/create", forwardToAuth, {
    detail: {
      description: "Create a new organization",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                name: { example: "My Organization", type: "string" },
                slug: { example: "my-org", type: "string" },
              },
              required: ["name", "slug"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .get("/organization/get-full-organization", forwardGetToAuth, {
    detail: {
      description: "Get full organization details including members",
      tags: ["Organization"],
    },
  })
  .post("/organization/update", forwardToAuth, {
    detail: {
      description: "Update organization details",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                data: {
                  properties: {
                    name: { type: "string" },
                    slug: { type: "string" },
                  },
                  type: "object",
                },
                organizationId: { type: "string" },
              },
              required: ["organizationId", "data"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .post("/organization/delete", forwardToAuth, {
    detail: {
      description: "Delete an organization (owner only)",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                organizationId: { type: "string" },
              },
              required: ["organizationId"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .post("/organization/set-active", forwardToAuth, {
    detail: {
      description: "Set the active organization for the current session",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                organizationId: { type: "string" },
              },
              required: ["organizationId"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .get("/organization/list-organizations", forwardGetToAuth, {
    detail: {
      description: "List all organizations the user is a member of",
      tags: ["Organization"],
    },
  })
  .get("/organization/check-slug", forwardGetToAuth, {
    detail: {
      description: "Check if an organization slug is available",
      tags: ["Organization"],
    },
  })

  // ============== Member Management ==============
  .get("/organization/list-members", forwardGetToAuth, {
    detail: {
      description: "List all members of an organization",
      tags: ["Organization"],
    },
  })
  .post("/organization/add-member", forwardToAuth, {
    detail: {
      description: "Add a user directly to an organization",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                organizationId: { type: "string" },
                role: { example: "member", type: "string" },
                userId: { type: "string" },
              },
              required: ["organizationId", "userId", "role"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .post("/organization/remove-member", forwardToAuth, {
    detail: {
      description: "Remove a member from an organization",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                memberId: { type: "string" },
                organizationId: { type: "string" },
              },
              required: ["organizationId", "memberId"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .post("/organization/update-member-role", forwardToAuth, {
    detail: {
      description: "Update a member's role in the organization",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                memberId: { type: "string" },
                organizationId: { type: "string" },
                role: { example: "admin", type: "string" },
              },
              required: ["organizationId", "memberId", "role"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .get("/organization/get-active-member", forwardGetToAuth, {
    detail: {
      description: "Get current user's member details in active organization",
      tags: ["Organization"],
    },
  })
  .post("/organization/leave", forwardToAuth, {
    detail: {
      description: "Leave an organization",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                organizationId: { type: "string" },
              },
              required: ["organizationId"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })

  // ============== Invitations ==============
  .post("/organization/invite-member", forwardToAuth, {
    detail: {
      description: "Send an invitation to join an organization",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                email: { example: "user@example.com", type: "string" },
                organizationId: { type: "string" },
                role: { example: "member", type: "string" },
              },
              required: ["organizationId", "email", "role"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .post("/organization/accept-invitation", forwardToAuth, {
    detail: {
      description: "Accept an organization invitation",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                invitationId: { type: "string" },
              },
              required: ["invitationId"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .post("/organization/reject-invitation", forwardToAuth, {
    detail: {
      description: "Reject an organization invitation",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                invitationId: { type: "string" },
              },
              required: ["invitationId"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .post("/organization/cancel-invitation", forwardToAuth, {
    detail: {
      description: "Cancel a pending invitation",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                invitationId: { type: "string" },
              },
              required: ["invitationId"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  })
  .get("/organization/get-invitation", forwardGetToAuth, {
    detail: {
      description: "Get details of a specific invitation",
      tags: ["Organization"],
    },
  })
  .get("/organization/list-invitations", forwardGetToAuth, {
    detail: {
      description: "List all invitations for an organization",
      tags: ["Organization"],
    },
  })

  // ============== Access Control ==============
  .post("/organization/has-permission", forwardToAuth, {
    detail: {
      description: "Check if user has specific permissions in the organization",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              properties: {
                organizationId: { type: "string" },
                permission: { type: "string" },
              },
              required: ["organizationId", "permission"],
              type: "object",
            },
          },
        },
      },
      tags: ["Organization"],
    },
    parse: "json",
  });
