
import { getActionById, getActionTypes, getCategories, getSubcategories, getAffectedAreas, getCenters, getResponsibilityRoles } from "@/lib/data"
import { notFound } from "next/navigation"
import { ActionDetailsTab } from "@/components/action-details-tab"


export default async function ActionDetailPage({ params }: { params: { id: string } }) {
  const actionId = params.id as string;
  if (!actionId) {
    notFound();
  }
  
  const actionData = await getActionById(actionId);

  if (!actionData) {
    notFound();
  }

  const [types, cats, subcats, areas, centers, roles] = await Promise.all([
    getActionTypes(),
    getCategories(),
    getSubcategories(),
    getAffectedAreas(),
    getCenters(),
    getResponsibilityRoles(),
  ]);

  const masterData = {
    ambits: { data: types },
    origins: { data: cats },
    classifications: { data: subcats },
    affectedAreas: areas,
    centers: { data: centers },
    responsibilityRoles: { data: roles },
  };


  return (
    <ActionDetailsTab
      initialAction={actionData}
      masterData={masterData}
    />
  )
}
