import { LessonList } from "@/features/dashboard/lesson-list";

export default function DashboardPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-black">
            <div className="z-10 max-w-5xl w-full flex flex-col gap-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <LessonList />
            </div>
        </main>
    );
}
