import { Image } from "antd";
import type { ImageProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import api from "../../../apiConfig/axiosConfig";
import { shouldUseAuthenticatedImageRequest, toDisplayImageUrl } from "../productForm.utils";

interface ProductImageProps extends Omit<ImageProps, "src"> {
  src?: string;
}

const ProductImage = ({ src, ...imageProps }: ProductImageProps) => {
  const normalizedSrc = src?.trim() ?? "";
  const displaySrc = useMemo(() => toDisplayImageUrl(normalizedSrc), [normalizedSrc]);
  const [resolvedSrc, setResolvedSrc] = useState(displaySrc);

  useEffect(() => {
    setResolvedSrc(displaySrc);
  }, [displaySrc]);

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
        setResolvedSrc(objectUrl);
      } catch {
        if (!disposed) {
          setResolvedSrc(displaySrc);
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

  return <Image {...imageProps} src={resolvedSrc || displaySrc || undefined} />;
};

export default ProductImage;
