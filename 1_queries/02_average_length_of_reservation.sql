-- a query to see the average duration of a reservation.
SELECT avg(end_date - start_date) as average_duration
FROM reservations;