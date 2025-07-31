
import { connectToDatabase } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  await connectToDatabase();
  const transaction = await Transaction.create(body);
  return NextResponse.json(transaction, { status: 201 });
}
