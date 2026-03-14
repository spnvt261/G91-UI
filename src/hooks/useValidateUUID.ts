import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../context/notifyContext";

export const useValidateUUID = (
  id: string | undefined,
  redirectTo: string,
  notifyIfError?: string
) => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const redirected = useRef(false);
  // const isUUID = (value: string) =>
  //   /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
  //     value
  //   );
  const isUUID = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      value
    );

  useEffect(() => {
    if (redirected.current) return;

    if (!id || !isUUID(id)) {
      redirected.current = true;
      if (notifyIfError) {
        notify(notifyIfError, "error");
      }
      navigate(redirectTo, { replace: true });
    }
  }, [id, navigate, redirectTo, notify, notifyIfError]);
};
