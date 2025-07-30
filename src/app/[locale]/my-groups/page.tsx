
import { getGroupsForUser } from "@/lib/data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/firebase"
import { redirect } from "next/navigation"

// This is a server component, but we need to get the current user.
// We can't use the useAuth hook here.
// A common pattern is to get the session on the server.
// For now, we'll assume a mock user ID for demonstration.
// In a real app, you would get this from the session.
const MOCK_USER_ID = "user-1" // Replace with actual user logic later

export default async function MyGroupsPage() {
  const t = await getTranslations("MyGroupsPage")
  
  // In a real app, you would get the user from the session.
  // For now, we use a mock ID.
  // const session = await auth.getSession(); -> This would be the ideal way
  // if (!session.user) {
  //   redirect("/login")
  // }
  // const userGroups = await getGroupsForUser(session.user.id)
  
  const userGroups = await getGroupsForUser(MOCK_USER_ID)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("col.name")}</TableHead>
              <TableHead>{t("col.id")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userGroups.length > 0 ? (
              userGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.id}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  {t("noGroups")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
