import { NextResponse, NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { auth } from "@clerk/nextjs/server";


export async function POST(request: NextRequest){

   try {
    const {userId} = await auth();
    if(!userId){
        return NextResponse.json({error: "Unauthorized request"}, {status: 401})
    }
    const body = await request.json();
    
    if(!body){
        return NextResponse.json({error: "No body passed"}, {status: 500})
        
    }
    const {name, email, subject, message}: {name: string, email: string, subject: string, message: string, } = body;

    if(!name || !email || !subject || !message){
        return NextResponse.json({error: "No data provided"}, {status: 400})
    }

    const {data, error} = await supabaseServer.from("contact_us").upsert({
        user_name: name,
        email: email,
        subject: subject,
        message: message
    })

    
    if(error){
        console.log(`Error upserting user query ${error}`)
        return NextResponse.json({
            error: "Error while upserting message"
        },{status: 500})
    }

    return NextResponse.json({
        success: true,
        data: data
    }, {status: 201})
   } catch (error: any) {
    console.log(`contact us route error ${error}`)
    NextResponse.json({error: "internal server error ", details: `${error.message}`}, {status: 500})
   }
} 