import { createClient } from "@/lib/supabaseServerClient";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";
import { GeneratorPage } from "@/components/pages/GeneratorPage";
import { redirect } from "next/navigation";
import { getCustomBusinessTypes } from "@/app/actions/customBusinessTypesActions";
import { BUSINESS_TYPES as PREDEFINED_BUSINESS_TYPES } from "@/utils/mileageUtils"; // Assuming this is the correct source
import { CustomBusinessType } from "@/types/custom_business_type";
import { BusinessType as PredefinedBusinessTypeStructure } from "@/utils/mileageUtils"; // Type for PREDEFINED_BUSINESS_TYPES

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?login=true&redirect=/generator");
  }

  const subscriptionStatus = await checkSubscriptionStatus();

  let customBusinessTypes: Pick<CustomBusinessType, 'id' | 'name'>[] = [];
  let predefinedBusinessTypes: PredefinedBusinessTypeStructure[] = PREDEFINED_BUSINESS_TYPES; // Already imported

  try {
    const customTypesResult = await getCustomBusinessTypes();
    if (customTypesResult.error) {
      console.error("Error fetching custom business types in generator page:", customTypesResult.error);
      // Decide on error handling: proceed with empty custom types or show error page
    } else {
      customBusinessTypes = customTypesResult.data;
    }
  } catch (error) {
    console.error("Exception fetching custom business types in generator page:", error);
    // Decide on error handling
  }
  
  // Pass the fetched and predefined types to the client component GeneratorPage
  return (
    <GeneratorPage
      subscriptionStatus={subscriptionStatus}
      customBusinessTypes={customBusinessTypes}
      predefinedBusinessTypes={predefinedBusinessTypes}
    />
  );
}
