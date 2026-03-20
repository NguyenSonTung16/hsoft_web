-- Patient intake schema (Oracle)
-- Compatible with hoft-web-backend/src/modules/patient-intake/patient-intake.repository.ts

-- ==========================================================
-- 1) Patient master table
-- ==========================================================
CREATE TABLE BTDBN (
  ID            VARCHAR2(32) NOT NULL,
  MA_BN         VARCHAR2(30) NOT NULL,
  HO_TEN        VARCHAR2(200) NOT NULL,
  NGAY_SINH     DATE NOT NULL,
  GIOI_TINH     VARCHAR2(20) NOT NULL,
  SO_THE_BHYT   VARCHAR2(30),
  CREATED_AT    TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT    TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_BTDBN PRIMARY KEY (ID),
  CONSTRAINT UQ_BTDBN_MA_BN UNIQUE (MA_BN)
);

-- ==========================================================
-- 2) Administrative info table
-- ==========================================================
CREATE TABLE HANHCHANH (
  ID              VARCHAR2(32) NOT NULL,
  PATIENT_ID      VARCHAR2(32) NOT NULL,
  MA_BN           VARCHAR2(30) NOT NULL,
  DIA_CHI         VARCHAR2(500),
  SO_DIEN_THOAI   VARCHAR2(20),
  LOAI_BENH_NHAN  VARCHAR2(30) NOT NULL,
  DOI_TUONG       VARCHAR2(30) NOT NULL,
  CREATED_AT      TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT      TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT PK_HANHCHANH PRIMARY KEY (ID),
  CONSTRAINT FK_HANHCHANH_PATIENT FOREIGN KEY (PATIENT_ID)
    REFERENCES BTDBN (ID),
  CONSTRAINT UQ_HANHCHANH_MA_BN UNIQUE (MA_BN)
);

-- ==========================================================
-- 3) Performance indexes
-- ==========================================================
CREATE INDEX IX_HANHCHANH_PATIENT_ID ON HANHCHANH (PATIENT_ID);
CREATE INDEX IX_HANHCHANH_SO_DIEN_THOAI ON HANHCHANH (SO_DIEN_THOAI);

COMMIT;
