-- Login transaction package deployment script
-- WARNING: This script replaces PKG_XETNGHIEM spec/body with the login procedure only.
-- If your package currently has other procedures/functions, export and merge first.

CREATE OR REPLACE PACKAGE pkg_xetnghiem AS
	PROCEDURE LIS_SUBMIT_LOGIN_TXN (
		p_session_token IN VARCHAR2,
		p_user_id       IN VARCHAR2,
		p_facility_id   IN VARCHAR2,
		p_lab_area_id   IN VARCHAR2,
		p_work_date     IN VARCHAR2,
		p_username      IN VARCHAR2,
		p_issued_at     IN TIMESTAMP,
		p_expires_at    IN TIMESTAMP,
		p_session_id    OUT VARCHAR2
	);
END pkg_xetnghiem;
/

CREATE OR REPLACE PACKAGE BODY pkg_xetnghiem AS
	PROCEDURE LIS_SUBMIT_LOGIN_TXN (
		p_session_token IN VARCHAR2,
		p_user_id       IN VARCHAR2,
		p_facility_id   IN VARCHAR2,
		p_lab_area_id   IN VARCHAR2,
		p_work_date     IN VARCHAR2,
		p_username      IN VARCHAR2,
		p_issued_at     IN TIMESTAMP,
		p_expires_at    IN TIMESTAMP,
		p_session_id    OUT VARCHAR2
	) AS
	BEGIN
		INSERT INTO LIS_SESSION (
			ID,
			SESSION_TOKEN,
			USER_ID,
			FACILITY_ID,
			LAB_AREA_ID,
			WORK_DATE,
			STATUS,
			ISSUED_AT,
			EXPIRES_AT
		) VALUES (
			RAWTOHEX(SYS_GUID()),
			p_session_token,
			p_user_id,
			p_facility_id,
			p_lab_area_id,
			TO_DATE(p_work_date, 'YYYY-MM-DD'),
			'success',
			p_issued_at,
			p_expires_at
		)
		RETURNING ID INTO p_session_id;

		INSERT INTO LIS_LOGIN_ATTEMPT_LOG (
			ID,
			EVENT_TYPE,
			USERNAME,
			FACILITY_ID,
			LAB_AREA_ID,
			SESSION_ID,
			OCCURRED_AT
		) VALUES (
			RAWTOHEX(SYS_GUID()),
			'submit_success',
			p_username,
			p_facility_id,
			p_lab_area_id,
			p_session_id,
			SYSTIMESTAMP
		);

		UPDATE LIS_USER_ACCOUNT
		SET
			FAILED_ATTEMPTS = 0,
			LAST_LOGIN_AT = SYSTIMESTAMP
		WHERE ID = p_user_id;
	END LIS_SUBMIT_LOGIN_TXN;
END pkg_xetnghiem;
/

-- Post-deployment validation queries (run in target schema)
SELECT NAME, TYPE, REFERENCED_NAME, REFERENCED_TYPE
FROM USER_DEPENDENCIES
WHERE REFERENCED_NAME = 'PKG_XETNGHIEM'
ORDER BY NAME, TYPE;

SELECT NAME, TYPE, LINE, POSITION, TEXT
FROM USER_ERRORS
WHERE NAME = 'PKG_XETNGHIEM'
ORDER BY TYPE, SEQUENCE;

SELECT OBJECT_NAME, OBJECT_TYPE, STATUS
FROM USER_OBJECTS
WHERE STATUS <> 'VALID'
ORDER BY OBJECT_NAME, OBJECT_TYPE;
