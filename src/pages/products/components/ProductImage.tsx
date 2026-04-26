import { Image } from "antd";
import type { ImageProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "../../../apiConfig/axiosConfig";
import { shouldUseAuthenticatedImageRequest, toDisplayImageUrl } from "../productForm.utils";

interface ProductImageProps extends Omit<ImageProps, "src" | "fallback"> {
  src?: string;
  fallback?: ReactNode;
}

const ProductImage = ({ src, fallback, onError, ...imageProps }: ProductImageProps) => {
  const normalizedSrc = src?.trim() ?? "";
  const displaySrc = useMemo(() => toDisplayImageUrl(normalizedSrc), [normalizedSrc]);
  const [authenticatedImage, setAuthenticatedImage] = useState<{ source: string; objectUrl: string } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = authenticatedImage?.source === displaySrc ? authenticatedImage.objectUrl : displaySrc;
  const imageFailed = failedSrc === displaySrc;

  useEffect(() => {
    if (!displaySrc || !shouldUseAuthenticatedImageRequest(normalizedSrc)) {
      return;
    }

    let disposed = false;
    let objectUrl: string | null = null;
    const controller = new AbortController();

    const loadImageWithAuthorization = async () => {
      try {
        const response = await api.get<Blob>(displaySrc, {
          responseType: "blob",
          signal: controller.signal,
        });

        if (disposed) {
          return;
        }

        objectUrl = URL.createObjectURL(response.data);
        setAuthenticatedImage({ source: displaySrc, objectUrl });
      } catch {
        if (!disposed) {
          setFailedSrc(displaySrc);
        }
      }
    };

    void loadImageWithAuthorization();

    return () => {
      disposed = true;
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [displaySrc, normalizedSrc]);

  if (fallback && (!displaySrc || imageFailed)) {
    return <>{fallback}</>;
  }

  return (
    <Image
      {...imageProps}
      src={resolvedSrc || displaySrc || undefined}
      onError={(event) => {
        setFailedSrc(displaySrc);
        onError?.(event);
      }}
    />
  );
};

export default ProductImage;
