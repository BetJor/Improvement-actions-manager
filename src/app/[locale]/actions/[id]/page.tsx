
import { getActionById, getActionTypes, getCategories, getSubcategories, getAffectedAreas } from "@/lib/data"
import { notFound } from "next/navigation"
import { ActionDetailsPanel } from "@/components/action-details-panel"
import { ActionDetailsTab } from "@/components/action-details-tab"


export default async function ActionDetailPage({ params }: { params: { id: string } }) {
  const actionId = params.id as string;
  if (!actionId) {
    notFound();
  }
  
  // Carreguem totes les dades al servidor per a un rendiment òptim
  const actionData = await getActionById(actionId);

  if (!actionData) {
    notFound();
  }

  // Carreguem les dades mestres en paral·lel
  const [types, cats, subcats, areas] = await Promise.all([
    getActionTypes(),
    getCategories(),
    getSubcategories(),
    getAffectedAreas(),
  ]);

  const masterData = {
    actionTypes: types,
    categories: cats,
    subcategories: subcats,
    affectedAreas: areas,
  };


  return (
    <ActionDetailsTab
      initialAction={actionData}
      masterData={masterData}
    />
  )
}
