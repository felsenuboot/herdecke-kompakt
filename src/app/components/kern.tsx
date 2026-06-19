'use client';

/**
 * Client boundary for the KERN React Kit (@publicplan/kern-react-kit, EUPL-1.2).
 *
 * The kit ships no "use client" directive and its components use hooks, so they
 * must cross a client boundary in the App Router. Importing the originals here
 * (rather than re-implementing their markup with kern-* classes) means the app
 * tracks KERN upgrades — new markup, a11y fixes and class changes — for free.
 *
 * Server Components may import from this module and render these components with
 * serializable (string/number/boolean) props; anything needing an event handler
 * must live in a Client Component.
 */
export {
  Button,
  Badge,
  Icon,
  Alert,
  Link as KernLink,
  TextInput,
  EmailInput,
  SelectInput,
  InputPrimitive,
} from '@publicplan/kern-react-kit';
