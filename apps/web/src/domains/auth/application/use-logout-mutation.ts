import * as React from "react";
import { useNavigate } from "react-router";

import { logout as logoutApi } from "../api";

export function useLogoutMutation(): {
  isSubmitting: boolean;
  logout: () => void;
} {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const logout = React.useCallback(async () => {
    setIsSubmitting(true);
    try {
      await logoutApi();
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  return { isSubmitting, logout };
}
