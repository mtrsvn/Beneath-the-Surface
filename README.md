# Beneath the Surface

A local React + Vite informational website about tawilis, Taal Lake, and the fishing communities of Agoncillo, Batangas.

## Content

The public page covers the species and its natural habitat, local culture and livelihoods, conservation, and general guidance for responsible visitors. It contains no survey, research results, academic framework, or manuscript details.

The supplied G2-BSTM 4E.docx informs the background content. Its private appendices are not distributed. Public conservation sources and photo credits remain linked in the footer. Activities, schedules, prices, and local restrictions require confirmation with local authorities; the site does not provide bookings.

## Run locally

Run npm install if dependencies are missing, then npm run dev. Open the local URL printed by Vite.

## Production build

Run npm run build. Output is written to dist/. Photos are stored locally in public/assets/. Google Fonts are optional, with system font fallbacks.
# Beneath-the-Surface

## Expanded public content

The food-and-culture and community-learning sections are paraphrased from the supplied manuscript. Internal source mapping:

- Chapter I, Background: fisheries-based tourism connects local livelihoods, food preparation, and visitor learning.
- Chapter II, Economic and Agricultural Dimensions: tawilis is traded fresh and processed; fisherfolk form the first link in the supply chain.
- Chapter IV, socio-cultural discussion: the Tawilis Festival is associated with Agoncillo culture and Taal Lake harvests.
- Chapter V, socio-cultural recommendations: culinary demonstrations, local stories, and festival promotion.
- Chapter V, agricultural recommendations: demonstrations of permitted fishing practices, annual fishing moratorium and seasonal restrictions, and crafts, illustrations, and educational materials that do not require fish harvesting.

Suggested experiences remain subject to local arrangements. No particular tour, festival programme, recipe, price, date, or souvenir stock is represented as confirmed. Source mapping is for maintainers and is not displayed on the public page.

The quick facts summarize species habitat, endemism, conservation, and livelihoods. The expanded threats section paraphrases the manuscript’s environmental discussion (Definitions and Chapter IV): overexploitation, pollution, habitat degradation, and introduced fish species. The static visitor checklist consolidates the manuscript’s recommendations for visitor information, conservation education, community participation, and responsible practices. It is not a questionnaire and collects no data. No quantitative threat estimates, medical claims, current restriction dates, or guaranteed local services are added.

## Interaction checks

Run npm test for the DOM interaction checks: menu focus trapping and Escape, section focus after navigation, scroll-lock cleanup, switching to desktop, FAQ state after repeated clicks, active section navigation, and link targets. These checks do not replace a visual browser review.
