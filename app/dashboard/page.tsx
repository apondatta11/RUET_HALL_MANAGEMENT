// app/dashboard/page.tsx
// server component
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard(){
    const session = await auth();
    console.log(session?.user.role);
    if(!session?.user){
        redirect("/login");
    }
    if(session?.user.role === "ADMIN"){
        redirect("/admin/dashboard");
    }
    else if(session?.user.role === "MANAGER"){
        redirect("/manager/dashboard");
    }
    else if(session?.user.role === "STUDENT"){
        redirect("/student/dashboard");
    }
}