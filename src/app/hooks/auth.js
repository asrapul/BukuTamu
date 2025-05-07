'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useAuthMiddleware(redirectTo='/login2'){
    const router=useRouter()
    useEffect(()=>{
        const token=localStorage.getItem('auth_token')
        if(!token){
            router.push(redirectTo)
        }
    },[router])
}