export const checkIsSessionExpired = (dateStr?: string | null, timeStr?: string | null, isExpiredProp?: boolean): boolean => {
  if (typeof isExpiredProp === "boolean") return isExpiredProp;
  if (!dateStr) return false;

  try {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (dateStr < todayStr) return true;
    if (dateStr > todayStr) return false;

    if (!timeStr) return false;

    const parts = timeStr.split(/[-–—]/);
    const endTimeRaw = parts[parts.length - 1].trim();
    if (!endTimeRaw) return false;

    const match = endTimeRaw.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/i);
    if (!match) return false;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3]?.toLowerCase();

    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 59);
    return now > endDateTime;
  } catch {
    return false;
  }
};

export const isLiveClassJoinDisabled = (video: any): boolean => {
  if (!video) return false;
  const now = new Date();

  // 1. Check end_time
  const endTimeStr = video.end_time || video.endTime;
  if (endTimeStr) {
    const endDate = new Date(endTimeStr);
    if (!Number.isNaN(endDate.getTime())) {
      // 30 minutes grace period after class end time
      const cutoff = new Date(endDate.getTime() + 30 * 60 * 1000);
      return now > cutoff;
    }
  }

  // 2. Check start_time + duration
  const startTimeStr = video.start_time || video.startTime;
  if (startTimeStr) {
    const startDate = new Date(startTimeStr);
    if (!Number.isNaN(startDate.getTime())) {
      let durationMinutes = 60;
      const durationVal = video.duration || video.courseDuration;
      if (durationVal) {
        const durStr = String(durationVal).toLowerCase();
        if (durStr.includes("hour")) {
          const match = durStr.match(/(\d+(\.\d+)?)/);
          if (match) durationMinutes = parseFloat(match[1]) * 60;
        } else if (durStr.includes("min")) {
          const match = durStr.match(/(\d+)/);
          if (match) durationMinutes = parseInt(match[1], 10);
        }
      }
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
      const cutoff = new Date(endDate.getTime() + 30 * 60 * 1000);
      return now > cutoff;
    }
  }

  // 3. Fallback for date string
  const dateVal = video.rawDate || video.dateLabel || video.date;
  if (dateVal && dateVal !== "N/A") {
    const parsedDate = new Date(dateVal);
    if (!Number.isNaN(parsedDate.getTime())) {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const sessionDateStart = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).getTime();
      if (sessionDateStart < todayStart) {
        return true;
      }
    }
  }

  return false;
};
