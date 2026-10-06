package mde;

import java.io.PrintStream;
import java.util.List;

import org.eclipse.emf.ecore.EAttribute;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.EReference;
import org.eclipse.emf.ecore.EStructuralFeature;

/** Prints a model as an indented tree: one element per line, containment as nesting. */
final class ModelPrinter {

  static void print(List<EObject> roots, PrintStream console) {
    if (roots.isEmpty()) console.println("(the target model is empty)");
    for (EObject root : roots) print(root, 0, console);
  }

  private static void print(EObject object, int depth, PrintStream console) {
    StringBuilder line = new StringBuilder("  ".repeat(depth)).append(object.eClass().getName());
    for (EAttribute attribute : object.eClass().getEAllAttributes()) {
      if (object.eIsSet(attribute)) line.append(' ').append(attribute.getName()).append('=').append(format(object.eGet(attribute)));
    }
    for (EReference reference : object.eClass().getEAllReferences()) {
      if (reference.isContainment() || reference.isContainer() || !object.eIsSet(reference)) continue;
      Object value = object.eGet(reference);
      line.append(' ').append(reference.getName()).append("->");
      if (value instanceof List<?> list) {
        line.append('[');
        for (int i = 0; i < list.size(); i++) line.append(i == 0 ? "" : ", ").append(label((EObject) list.get(i)));
        line.append(']');
      } else {
        line.append(label((EObject) value));
      }
    }
    console.println(line);
    for (EObject child : object.eContents()) print(child, depth + 1, console);
  }

  private static String label(EObject object) {
    EStructuralFeature name = object.eClass().getEStructuralFeature("name");
    if (name != null && object.eGet(name) != null) return String.valueOf(object.eGet(name));
    return object.eClass().getName();
  }

  private static String format(Object value) {
    return value instanceof String s ? '"' + s + '"' : String.valueOf(value);
  }
}
