import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/catalog/product_detail_screen.dart';
import '../features/catalog/products_screen.dart';
import '../features/home/home_screen.dart';
import '../features/xinobi_u/questionnaire_screen.dart';
import '../features/xinobi_u/xinobi_u_screen.dart';

/// Three tabs keep their own navigation stacks; product detail opens above the tabs so Android back returns to the list.
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

class _Shell extends StatelessWidget {
  const _Shell({required this.shell});
  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) => Scaffold(
        body: shell,
        bottomNavigationBar: NavigationBar(
          selectedIndex: shell.currentIndex,
          onDestinationSelected: (index) => shell.goBranch(index, initialLocation: index == shell.currentIndex),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Ana sayfa'),
            NavigationDestination(icon: Icon(Icons.grid_view_outlined), selectedIcon: Icon(Icons.grid_view), label: 'Ürünler'),
            NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), selectedIcon: Icon(Icons.auto_awesome), label: 'XINOBI U'),
          ],
        ),
      );
}
