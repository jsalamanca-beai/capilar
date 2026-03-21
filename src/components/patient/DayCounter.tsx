"use client";

interface DayCounterProps {
  currentDay: number;
  firstName: string;
}

export default function DayCounter({ currentDay, firstName }: DayCounterProps) {
  const isPreOp = currentDay < 0;
  const isSurgeryDay = currentDay === 0;

  return (
    <div className="text-center py-6">
      <p className="text-text-muted text-sm mb-1">
        {isPreOp
          ? `Hola ${firstName}, faltan`
          : isSurgeryDay
            ? `Hola ${firstName}`
            : `Hola ${firstName}, llevas`}
      </p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-5xl font-light text-gold">
          {isSurgeryDay ? "HOY" : Math.abs(currentDay)}
        </span>
        {!isSurgeryDay && (
          <span className="text-text-muted text-sm">
            {Math.abs(currentDay) === 1 ? "dia" : "dias"}
            <br />
            {isPreOp ? "para tu cirugia" : "de recuperacion"}
          </span>
        )}
      </div>
      {isSurgeryDay && (
        <p className="text-gold text-lg mt-1">es el dia de tu cirugia</p>
      )}
    </div>
  );
}
