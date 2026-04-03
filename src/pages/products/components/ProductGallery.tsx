import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Empty, Modal, Skeleton, Space, Typography } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductImage from "./ProductImage";

interface ProductGalleryProps {
  productName: string;
  mainImage?: string;
  imageUrls?: string[];
}

const MIN_MAIN_LOADING_MS = 220;

const ProductGallery = ({ productName, mainImage, imageUrls }: ProductGalleryProps) => {
  const images = useMemo(() => {
    const source = [mainImage, ...(imageUrls ?? [])].filter(Boolean) as string[];
    return [...new Set(source)];
  }, [imageUrls, mainImage]);

  const [activeImage, setActiveImage] = useState<string>(images[0] ?? "");
  const [mainLoaded, setMainLoaded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const mainLoadStartedAtRef = useRef(0);
  const mainLoadTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!images.length) {
      setActiveImage("");
      return;
    }

    if (!activeImage || !images.includes(activeImage)) {
      setActiveImage(images[0]);
    }
  }, [activeImage, images]);

  useEffect(() => {
    if (mainLoadTimerRef.current != null) {
      window.clearTimeout(mainLoadTimerRef.current);
      mainLoadTimerRef.current = null;
    }

    mainLoadStartedAtRef.current = Date.now();
    setMainLoaded(false);
  }, [activeImage]);

  useEffect(
    () => () => {
      if (mainLoadTimerRef.current != null) {
        window.clearTimeout(mainLoadTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!images.length) {
      setPreviewIndex(0);
      return;
    }

    if (previewIndex >= images.length) {
      setPreviewIndex(images.length - 1);
    }
  }, [images, previewIndex]);

  const activeIndex = Math.max(0, images.indexOf(activeImage));
  const canGoPrev = previewIndex > 0;
  const canGoNext = previewIndex < images.length - 1;

  const handleMainImageSettled = () => {
    if (mainLoadTimerRef.current != null) {
      window.clearTimeout(mainLoadTimerRef.current);
      mainLoadTimerRef.current = null;
    }

    const elapsed = Date.now() - mainLoadStartedAtRef.current;
    const remaining = Math.max(0, MIN_MAIN_LOADING_MS - elapsed);

    if (remaining === 0) {
      setMainLoaded(true);
      return;
    }

    mainLoadTimerRef.current = window.setTimeout(() => {
      setMainLoaded(true);
      mainLoadTimerRef.current = null;
    }, remaining);
  };

  if (images.length === 0) {
    return (
      <Space direction="vertical" size={12} align="center" style={{ width: "100%", padding: "24px 0" }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sản phẩm chưa có hình ảnh" />
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          height: 460,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "#f8fafc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {!mainLoaded ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Skeleton.Image active style={{ width: 220, height: 220 }} />
          </div>
        ) : null}

        <ProductImage
          key={activeImage}
          src={activeImage}
          alt={productName}
          preview={false}
          onLoad={handleMainImageSettled}
          onError={handleMainImageSettled}
          onClick={() => {
            setPreviewIndex(activeIndex);
            setPreviewOpen(true);
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            cursor: "zoom-in",
            opacity: mainLoaded ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        />
      </div>

      <Space wrap size={8}>
        {images.slice(0, 8).map((image) => {
          const isActive = image === activeImage;
          return (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(image)}
              style={{
                border: isActive ? "2px solid #1677ff" : "1px solid #d9d9d9",
                borderRadius: 10,
                padding: 2,
                background: "white",
                cursor: "pointer",
              }}
            >
              <ProductImage
                src={image}
                alt={`${productName} - ảnh`}
                width={88}
                height={64}
                preview={false}
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
            </button>
          );
        })}
      </Space>

      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Typography.Text type="secondary">
              {images.length > 0 ? `${previewIndex + 1} / ${images.length}` : "0 / 0"}
            </Typography.Text>
            <Space>
              <Button icon={<LeftOutlined />} disabled={!canGoPrev} onClick={() => setPreviewIndex((current) => current - 1)}>
                Ảnh trước
              </Button>
              <Button type="primary" icon={<RightOutlined />} disabled={!canGoNext} onClick={() => setPreviewIndex((current) => current + 1)}>
                Ảnh tiếp theo
              </Button>
            </Space>
          </Space>
        }
        width="min(92vw, 1100px)"
        centered
        destroyOnClose
      >
        <div
          style={{
            width: "100%",
            height: "70vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#0f172a",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <ProductImage
            src={images[previewIndex]}
            alt={`${productName} - ảnh ${previewIndex + 1}`}
            preview={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </Modal>

      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Nhấn vào ảnh nhỏ để đổi ảnh chính. Nhấn vào ảnh lớn để xem toàn màn hình và chuyển ảnh.
      </Typography.Text>
    </Space>
  );
};

export default ProductGallery;
