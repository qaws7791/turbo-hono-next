import * as React from "react";
import { useNavigate } from "react-router";

import { logout } from "../api";

export function useLogoutMutation(): {
  isSubmitting: boolean;
  doLogout: () => void;
} {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const doLogout = React.useCallback(async () => {
    setIsSubmitting(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  return { isSubmitting, doLogout };
}
