// /company — 대표 하위 메뉴(인사말)로 리다이렉트(부모 URL 소프트404 방지).
import { redirect } from "next/navigation";

export default function CompanyIndexPage() {
  redirect("/company/greeting");
}
