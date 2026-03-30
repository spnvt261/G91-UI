import { Empty, Image, Space, Typography } from "antd";
import { useMemo, useState } from "react";

interface ProductGalleryProps {
  productName: string;
  mainImage?: string;
  imageUrls?: string[];
}

const ProductGallery = ({ productName, mainImage, imageUrls }: ProductGalleryProps) => {
  const images = useMemo(() => {
    const source = [mainImage, ...(imageUrls ?? [])].filter(Boolean) as string[];
    return [...new Set(source)];
  }, [imageUrls, mainImage]);

  const [activeImage, setActiveImage] = useState<string>(images[0] ?? "");

  if (images.length === 0) {
    return (
      <Space direction="vertical" size={12} align="center" style={{ width: "100%", padding: "24px 0" }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sản phẩm chưa có hình ảnh" />
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Image src={activeImage} alt={productName} preview style={{ width: "100%", maxHeight: 460, objectFit: "cover", borderRadius: 12 }} />

      <Image.PreviewGroup>
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
                <Image src={image} alt={`${productName} - ảnh`} width={88} height={64} preview style={{ objectFit: "cover", borderRadius: 8 }} />
              </button>
            );
          })}
        </Space>
      </Image.PreviewGroup>

      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Nhấn vào ảnh nhỏ để xem nhanh, nhấn vào ảnh lớn để phóng to.
      </Typography.Text>
    </Space>
  );
};

export default ProductGallery;
