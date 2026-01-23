import React from "react";

const FeatureLegend = ({ columns }) => {
  if (!columns || columns.length === 0) return null;

  // Mảng màu cố định theo thứ tự RGB
  const colorMap = [{ color: "red" }, { color: "green" }, { color: "blue" }];

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        background: "#333",
        borderRadius: "8px",
        border: "1px solid #555",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
        Ý nghĩa màu sắc
      </h3>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {columns.map((colName, index) => {
          // Chỉ hiển thị 3 cột đầu tiên vì RGB chỉ có 3 kênh
          if (index > 2) return null;

          const legendInfo = colorMap[index];

          return (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {/* Hình tròn màu */}
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: legendInfo.color,
                  border: "2px solid white",
                }}
              ></div>

              {/* Tên cột + Tên kênh màu */}
              <div>
                <span style={{ fontWeight: "bold", color: legendInfo.color }}>
                  {colName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {columns.length > 3 && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "#aaa",
            fontStyle: "italic",
          }}
        >
          * Lưu ý: Chỉ 3 cột đầu tiên được dùng để tạo màu sắc. Các cột còn lại
          ({columns.slice(3).join(", ")}) vẫn được train nhưng không ảnh hưởng
          đến màu hiển thị.
        </div>
      )}
    </div>
  );
};

export default FeatureLegend;
