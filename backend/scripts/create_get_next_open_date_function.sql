-- ============================================
-- CREATE FUNCTION: get_next_open_date
-- ============================================
-- Purpose: Calculate the next opening date for a center
-- Parameters:
--   p_center_id: Center ID (BIGINT)
--   p_current_date: Reference date (DATE)
-- Returns: Next opening date and time ('YYYY-MM-DD HH:MM:SS') or NULL
-- Logic:
--   1. Start from the day after p_current_date
--   2. Search up to 14 days ahead
--   3. For each date:
--      - Check if it's a holiday in center_holidays table
--      - If not a holiday, check center_operating_hours for that day_of_week
--      - If center is open, return date + open_time
--   4. Return NULL if no open date found within 14 days

DROP FUNCTION IF EXISTS get_next_open_date;

DELIMITER $$

CREATE FUNCTION get_next_open_date(
    p_center_id BIGINT,
    p_current_date DATE
)
RETURNS VARCHAR(50)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_check_date DATE;
    DECLARE v_day_of_week INT;
    DECLARE v_is_holiday INT;
    DECLARE v_is_open BOOLEAN;
    DECLARE v_open_time TIME;
    DECLARE v_result VARCHAR(50);
    DECLARE v_days_checked INT DEFAULT 0;
    DECLARE v_max_days INT DEFAULT 14;

    -- Start checking from the next day
    SET v_check_date = DATE_ADD(p_current_date, INTERVAL 1 DAY);

    -- Loop through up to 14 days
    WHILE v_days_checked < v_max_days DO
        -- Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
        SET v_day_of_week = DAYOFWEEK(v_check_date) - 1;

        -- Check if this date is a holiday
        SELECT COUNT(*)
        INTO v_is_holiday
        FROM center_holidays
        WHERE center_id = p_center_id
          AND holiday_date = v_check_date;

        -- If not a holiday, check operating hours
        IF v_is_holiday = 0 THEN
            -- Get operating hours for this day of week
            SELECT is_open, open_time
            INTO v_is_open, v_open_time
            FROM center_operating_hours
            WHERE center_id = p_center_id
              AND day_of_week = v_day_of_week
            LIMIT 1;

            -- If center is open on this day, return the datetime
            IF v_is_open = TRUE AND v_open_time IS NOT NULL THEN
                SET v_result = CONCAT(
                    DATE_FORMAT(v_check_date, '%Y-%m-%d'),
                    ' ',
                    DATE_FORMAT(v_open_time, '%H:%i:%s')
                );
                RETURN v_result;
            END IF;
        END IF;

        -- Move to next day
        SET v_check_date = DATE_ADD(v_check_date, INTERVAL 1 DAY);
        SET v_days_checked = v_days_checked + 1;
    END WHILE;

    -- No open date found within 14 days
    RETURN NULL;
END$$

DELIMITER ;

-- ============================================
-- Test the function (commented out - uncomment to test)
-- ============================================
-- Test 1: Get next open date for center 1 from current date
-- SELECT get_next_open_date(1, CURDATE()) AS next_open_date;

-- Test 2: Get next open date from a specific date
-- SELECT get_next_open_date(1, '2025-01-15') AS next_open_date;

-- Test 3: Test with a center that has holidays
-- SELECT
--     c.id,
--     c.center_name,
--     get_next_open_date(c.id, CURDATE()) AS next_open_date
-- FROM centers c
-- WHERE c.is_active = TRUE
-- LIMIT 5;
