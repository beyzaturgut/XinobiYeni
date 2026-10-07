import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/cart/cart.dart';
import '../features/cart/cart_screen.dart';

import '../features/catalog/product_detail_screen.dart';
import '../features/catalog/products_screen.dart';
import '../features/home/home_screen.dart';
import '../features/xinobi_u/questionnaire_screen.dart';
import '../features/xinobi_u/xinobi_u_screen.dart';

/// Four tabs keep their own navigation stacks; product detail opens above the tabs so Android back returns to the list.
GoRouter buildRouter({String initialLocation = '/'}) => GoRouter(
      initialLocation: initialLocation,
      routes: [
        StatefulShellRoute.indexedStack(
          builder: (context, state, shell) => _Shell(shell: shell),
          branches: [
            StatefulShellBranch(routes: [GoRoute(path: '/', builder: (context, state) => const HomeScreen())]),
            StatefulShellBranch(routes: [
              GoRoute(
                path: '/urunler',
                builder: (context, state) => ProductsScreen(
                  initialCategory: state.uri.queryParameters['kategori'],
                  focusSearch: state.uri.queryParameters['ara'] == '1',
                ),
              ),
            ]),
            StatefulShellBranch(routes: [GoRoute(path: '/xinobi-u', builder: (context, state) => const XinobiUScreen())]),
            StatefulShellBranch(routes: [GoRoute(path: '/sepet', builder: (context, state) => const CartScreen())]),
          ],
        ),
        GoRoute(path: '/urunler/:id', builder: (context, state) => ProductDetailScreen(productId: state.pathParameters['id']!)),
        GoRoute(
          path: '/xinobi-u/anket',
          builder: (context, state) => QuestionnaireScreen(
            productId: state.uri.queryParameters['urun'] ?? '',
            variantId: state.uri.queryParameters['renk'],
          ),
        ),
      ],
    );

class _Shell extends ConsumerWidget {
  const _Shell({required this.shell});
  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartCountProvider);
    return Scaffold(
        body: shell,
        bottomNavigationBar: NavigationBar(
          selectedIndex: shell.currentIndex,
          onDestinationSelected: (index) => shell.goBranch(index, initialLocation: index == shell.currentIndex),
          destinations: [
            const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Ana sayfa'),
            const NavigationDestination(icon: Icon(Icons.grid_view_outlined), selectedIcon: Icon(Icons.grid_view), label: 'Ürünler'),
            const NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), selectedIcon: Icon(Icons.auto_awesome), label: 'XINOBI U'),
            NavigationDestination(
              icon: Badge(isLabelVisible: count > 0, label: Text('$count'), child: const Icon(Icons.shopping_bag_outlined)),
              selectedIcon: Badge(isLabelVisible: count > 0, label: Text('$count'), child: const Icon(Icons.shopping_bag)),
              label: 'Sepet',
              tooltip: count > 0 ? 'Sepet, $count ürün' : 'Sepet',
            ),
          ],
        ),
      );
  }
}
